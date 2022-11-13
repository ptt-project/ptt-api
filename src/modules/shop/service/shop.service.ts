import { Injectable } from '@nestjs/common'
import { response } from 'src/utils/response'
import dayjs from 'dayjs'
import { PinoLogger } from 'nestjs-pino'
import { Condition } from 'src/db/entities/Condition'
import { Shop } from 'src/db/entities/Shop'
import { EntityManager, UpdateResult } from 'typeorm'
import { UnableToGetShopInfo, UnableToUpdateShopInfo } from 'src/utils/response-code'
import { Member } from 'src/db/entities/Member'
import { GetShopInfoType, UpdateShopInfoToDbParams, UpdateShopTobDbByIdType } from '../type/shop.type'

@Injectable()
export class ShopService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(ShopService.name)
  }

  GetShopInfoHandler(inquiryShopByMemberId: Promise<GetShopInfoType>) {
    return async (member: Member) => {
      const start = dayjs()
      const { id: memberId } = member

      const [shop, getShopInfoError] = await (await inquiryShopByMemberId)(memberId)

      if (getShopInfoError != '') {
        return response(undefined, UnableToGetShopInfo, getShopInfoError)
      }

      this.logger.info(`Done GetShopInfoHandler ${dayjs().diff(start)} ms`)
      return response(shop)
    }
  }

  UpdateShopInfoHandler(updateShopByMemberId: Promise<UpdateShopTobDbByIdType>) {
    return async (member: Member, params: UpdateShopInfoToDbParams) => {
      const start = dayjs()
      const { id: memberId } = member

      const updateShopInfoError = await (await updateShopByMemberId)(memberId, params)

      if (updateShopInfoError != '') {
        return response(undefined, UnableToUpdateShopInfo, updateShopInfoError)
      }

      this.logger.info(`Done UpdateShopInfoHandler ${dayjs().diff(start)} ms`)
      return response(undefined)
    }
  }

  async InquiryShopByMemberIdFunc(
    etm: EntityManager,
  ): Promise<GetShopInfoType> {
    return async (memberId: string): Promise<[Shop, string]> => {
      const start = dayjs()
      let shop: Shop
      try {
        shop = await etm.findOne(Shop, {
          withDeleted: false,
          where: { memberId },
        })
        if (!shop) {
          return [shop, 'Unable to get shop for this user']
        }
      } catch (error) {
        return [shop, error.message]
      }

      this.logger.info(
        `Done InquiryShopByMemberIdFunc ${dayjs().diff(start)} ms`,
      )
      return [shop, '']
    }
  }

  async UpdateShopByMemberIdFunc(
    etm: EntityManager,
  ): Promise<UpdateShopTobDbByIdType> {
    return async (
      memberId: string,
      params: UpdateShopInfoToDbParams,
    ): Promise<string> => {
      const start = dayjs()
      try {
        const result: UpdateResult = await etm.update(
          Shop,
          { memberId },
          { ...params },
        )
        if (result.raw === 0) {
          return 'Unable to update shop info'
        }
      } catch (error) {
        return error.message
      }

      this.logger.info(
        `Done UpdateShopByMemberIdFunc ${dayjs().diff(start)} ms`,
      )
      return ''
    }
  }
}
