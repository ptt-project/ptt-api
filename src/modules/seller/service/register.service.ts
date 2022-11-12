import { Injectable } from '@nestjs/common'
import { Member } from 'src/db/entities/Member'
import { response } from 'src/utils/response'
import { EntityManager } from 'typeorm'
import { RegisterSellerRequestDto } from '../dto/seller.dto'

import {
  InvalidSellerRegister,
  UnableCreatePartitionOfProductProfile,
  UnableInsertShopToDb,
  UnableToInsertWallet,
  UnableToUpdateShopWallet,
  UnableUpdateShopToDb,
} from 'src/utils/response-code'

import {
  InsertShopToDbParams,
  ValidateSellerRegisterType,
  InsertShopToDbType,
} from '../type/seller.type'
import { Shop } from 'src/db/entities/Shop'

import { PinoLogger } from 'nestjs-pino'
import dayjs from 'dayjs'
import { CreateTablePartitionOfProductProfileToDbType, UpdateShopWalletFuncType } from '../type/register.type'
import { InsertWalletToDbFuncType } from 'src/modules/wallet/type/wallet.type'

@Injectable()
export class RegisterService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(RegisterService.name)
  }

  RegisterSellerHandler(
    validateSellerData: Promise<ValidateSellerRegisterType>,
    insertShopToDb: Promise<InsertShopToDbType>,
    createTablePartitionOfProductProfileToDb: CreateTablePartitionOfProductProfileToDbType,
    insertWalletToDb: Promise<InsertWalletToDbFuncType>,
    updateShopWalletToDb: Promise<UpdateShopWalletFuncType>,
  ) {
    return async (member: Member, body: RegisterSellerRequestDto) => {
      const start = dayjs()
      const { id: memberId } = member

      const validateSellerError = await (await validateSellerData)(
        memberId,
        body,
        false,
      )

      if (validateSellerError != '') {
        return response(undefined, InvalidSellerRegister, validateSellerError)
      }

      const params: InsertShopToDbParams = {
        ...body,
        memberId,
      }
      const [shop, insertShopToDbError] = await (await insertShopToDb)(params)

      if (insertShopToDbError != '') {
        return response(undefined, UnableInsertShopToDb, insertShopToDbError)
      }

      const isErrorCreateTablePartitionOfProductProfileToDb = await createTablePartitionOfProductProfileToDb(
        shop.id,
      )
      if (isErrorCreateTablePartitionOfProductProfileToDb != '') {
        return response(
          undefined,
          UnableCreatePartitionOfProductProfile,
          isErrorCreateTablePartitionOfProductProfileToDb,
        )
      }

      const [wallet, insertWalletToDbError] = await (await insertWalletToDb)(
        member.id,
        shop.id,
      )
      if (insertWalletToDbError != '') {
        return response(undefined, UnableToInsertWallet, insertWalletToDbError)
      }

      const [updatedShop, updateShopWalletToDbError] = await (await updateShopWalletToDb)(
        shop,
        wallet.id
      )
      if (updateShopWalletToDbError != '') {
        return response(undefined, UnableToUpdateShopWallet, updateShopWalletToDbError)
      }

      this.logger.info(`Done registerSellerHandler ${dayjs().diff(start)} ms`)
      return response(updatedShop)
    }
  }

  ResubmitRegisterSellerHandler(
    validateSellerData: Promise<ValidateSellerRegisterType>,
    resubmitShopToDb: Promise<InsertShopToDbType>,
  ) {
    return async (member: Member, body: RegisterSellerRequestDto) => {
      const start = dayjs()
      const { id: memberId } = member

      const validateSellerError = await (await validateSellerData)(
        memberId,
        body,
        true,
      )

      if (validateSellerError != '') {
        return response(undefined, InvalidSellerRegister, validateSellerError)
      }

      const params: InsertShopToDbParams = {
        ...body,
        memberId,
      }
      const [shop, resubmitShopToDbError] = await (await resubmitShopToDb)(
        params,
      )

      if (resubmitShopToDbError != '') {
        return response(undefined, UnableUpdateShopToDb, resubmitShopToDbError)
      }

      this.logger.info(
        `Done resubmitRegisterSellerHandler ${dayjs().diff(start)} ms`,
      )
      return response(shop)
    }
  }

  async ValidateSellerDataFunc(
    etm: EntityManager,
  ): Promise<ValidateSellerRegisterType> {
    return async (
      memberId: string,
      params: InsertShopToDbParams,
      isResubmit: boolean,
    ): Promise<string> => {
      const start = dayjs()
      let shop: Shop

      try {
        shop = await etm.findOne(Shop, {
          where: [
            {
              deletedAt: null,
              email: params.email,
            },
            {
              deletedAt: null,
              mobile: params.mobile,
            },
            {
              deletedAt: null,
              corperateId: params.corperateId,
            },
          ],
        })
        if (!isResubmit && shop && shop.memberId === memberId) {
          return 'You have already register as a seller'
        }
        if (shop && shop.memberId !== memberId) {
          if (shop.email === params.email) {
            return 'email is alredy used'
          }
          if (shop.mobile === params.mobile) {
            return 'mobile is alredy used'
          }
          if (shop.corperateId === params.corperateId) {
            return 'corperateId is alredy used'
          }
        }
        if (
          params.type === 'Mall' &&
          (!params.corperateId ||
            !params.corperateName ||
            !params.mallApplicantRole)
        ) {
          return 'corperateId, corperateName and mallApplicantRole are required for Mall shop'
        }
      } catch (error) {
        return error.message
      }

      this.logger.info(`Done validateSellerDataFunc ${dayjs().diff(start)} ms`)
      return ''
    }
  }

  async InsertShopToDbFunc(etm: EntityManager): Promise<InsertShopToDbType> {
    return async (params: InsertShopToDbParams): Promise<[Shop, string]> => {
      const start = dayjs()
      let shop: Shop

      try {
        shop = etm.create(Shop, {
          fullName: params.fullName,
          memberId: params.memberId,
          mobile: params.mobile,
          email: params.email,
          brandName: params.brandName,
          category: params.category,
          website: params.website,
          facebookPage: params.facebookPage,
          instagram: params.instagram,
          socialMedia: params.socialMedia,
          note: params.note,
          corperateId: params.corperateId,
          corperateName: params.corperateName,
          mallApplicantRole: params.mallApplicantRole,
          mallOfflineShopDetail: params.mallOfflineShopDetail,
          mallShopDescription: params.mallShopDescription,
          approvalStatus: 'approved',
        })
        await etm.save(shop)
      } catch (error) {
        return [shop, error.message]
      }

      this.logger.info(`Done insertShopToDbFunc ${dayjs().diff(start)} ms`)
      return [shop, '']
    }
  }

  CreateTablePartitionOfProductProfileToDbFunc(
    etm: EntityManager,
  ): CreateTablePartitionOfProductProfileToDbType {
    return async (id: string): Promise<string> => {
      const tablePartiionName = `"product_profile_shop_${id}"`

      try {
        await etm.query(
          `CREATE TABLE ${tablePartiionName} PARTITION OF product_profiles FOR VALUES IN ('${id}');`,
        )
      } catch (error) {
        return error.message
      }

      return ''
    }
  }

  async ResubmitShopToDbFunc(etm: EntityManager): Promise<InsertShopToDbType> {
    return async (params: InsertShopToDbParams): Promise<[Shop, string]> => {
      const start = dayjs()
      let shop: Shop

      try {
        shop = await etm.findOne(Shop, {
          where: {
            memberId: params.memberId,
          },
        })

        if (!shop) {
          return [null, 'Unable to find shop for this user']
        }

        shop.type = params.type
        shop.fullName = params.fullName
        shop.memberId = params.memberId
        shop.mobile = params.mobile
        shop.email = params.email
        shop.brandName = params.brandName
        shop.category = params.category
        shop.website = params.website
        shop.facebookPage = params.facebookPage
        shop.instagram = params.instagram
        shop.socialMedia = params.socialMedia
        shop.note = params.note
        shop.corperateId = params.corperateId
        shop.corperateName = params.corperateName
        shop.mallApplicantRole = params.mallApplicantRole
        shop.mallOfflineShopDetail = params.mallOfflineShopDetail
        shop.mallShopDescription = params.mallShopDescription
        shop.approvalStatus = 'approved'

        await etm.save(shop)
      } catch (error) {
        return [shop, error.message]
      }

      this.logger.info(`Done resubmitShopToDbFunc ${dayjs().diff(start)} ms`)
      return [shop, '']
    }
  }

  async updateShopWalletFunc(etm: EntityManager): Promise<UpdateShopWalletFuncType> {
    return async (shop: Shop, walletId: string): Promise<[Shop, string]> => {
      const start = dayjs()

      try {
        shop.walletId = walletId

        await etm.save(shop)
      } catch (error) {
        return [shop, error.message]
      }

      this.logger.info(`Done updateShopWalletFunc ${dayjs().diff(start)} ms`)
      return [shop, '']
    }
  }
}
