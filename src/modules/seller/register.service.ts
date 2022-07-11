import { Injectable } from '@nestjs/common'
import { Member } from 'src/db/entities/Member'
import { response } from 'src/utils/response'
import { EntityManager } from 'typeorm'
import {
  RegisterSellerRequestDto,
} from './dto/seller.dto'

import {
  InvalidSellerRegister,
  UnableInsertShopToDb,
} from 'src/utils/response-code'

import {
  InsertShopToDbParams,
  ValidateSellerRegisterType,
  InsertShopToDbType,
} from './seller.type'
import { Shop } from 'src/db/entities/Shop'

@Injectable()
export class RegisterService {
  registerSellerHandler(
    validateSellerData: Promise<
      ValidateSellerRegisterType
    >,
    insertShopToDb: Promise<InsertShopToDbType>,
  ) {
    return async (member: Member, body: RegisterSellerRequestDto) => {
      const { id: memberId } = member

      const validateSellerError = await (await validateSellerData)(
        memberId,
        body,
        false
      )

      if (validateSellerError != '') {
        return response(
          undefined,
          InvalidSellerRegister,
          validateSellerError,
        )
      }
    

      const params: InsertShopToDbParams = {
        ...body,
        memberId,
      }
      const [shop, insertShopToDbError] = await (await insertShopToDb)(
        params,
      )

      if (insertShopToDbError != '') {
        return response(
          undefined,
          UnableInsertShopToDb,
          insertShopToDbError,
        )
      }

      return response(shop)
    }
  }

  resubmitRegisterSellerHandler(
    validateSellerData: Promise<
      ValidateSellerRegisterType
    >,
    resubmitShopToDb: Promise<InsertShopToDbType>,
  ) {
    return async (member: Member, body: RegisterSellerRequestDto) => {
      const { id: memberId } = member

      const validateSellerError = await (await validateSellerData)(
        memberId,
        body,
        true,
      )

      if (validateSellerError != '') {
        return response(
          undefined,
          InvalidSellerRegister,
          validateSellerError,
        )
      }
    

      const params: InsertShopToDbParams = {
        ...body,
        memberId,
      }
      const [shop, resubmitShopToDbError] = await (await resubmitShopToDb)(
        params,
      )

      if (resubmitShopToDbError != '') {
        return response(
          undefined,
          UnableInsertShopToDb,
          resubmitShopToDbError,
        )
      }

      return response(shop)
    }
  }

  async validateSellerDataFunc(
    etm: EntityManager,
  ): Promise<ValidateSellerRegisterType> {
    return async (
      memberId: number,
      params: InsertShopToDbParams,
      isResubmit: boolean,
    ): Promise<string> => {
      let shop: Shop

      try {
        shop = await etm.findOne(Shop, { where: [
            {
              deletedAt: null,
              email: params.email
            }, {
              deletedAt: null,
              mobile: params.mobile
            }, {
              deletedAt: null,
              corperateId: params.corperateId,
            }
          ]
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
        if (params.type === 'Mall' && (!params.corperateId || !params.corperateName)) {
          return 'corperateId and corperateName is required for Mall shop'
        }
      } catch (error) {
        return error
      }

      return ''
    }
  }

  async insertShopToDbFunc(
    etm: EntityManager,
  ): Promise<InsertShopToDbType> {
    return async (
      params: InsertShopToDbParams,
    ): Promise<[Shop, string]> => {
      let shop: Shop

      try {
        shop = Shop.create({
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
        })
        await etm.save(shop)
      } catch (error) {
        return [shop, error]
      }

      return [shop, '']
    }
  }

  async resubmitShopToDbFunc(
    etm: EntityManager,
  ): Promise<InsertShopToDbType> {
    return async (
      params: InsertShopToDbParams,
    ): Promise<[Shop, string]> => {
      let shop: Shop

      try {
        shop = await etm.findOne(Shop, {
          where: {
            memberId: params.memberId,
          }
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
        shop.approvalStatus = 'requested'
        
        await etm.save(shop)
      } catch (error) {
        return [shop, error]
      }

      return [shop, '']
    }
  }
}
