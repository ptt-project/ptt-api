import { Injectable } from '@nestjs/common'
import { Member } from 'src/db/entities/Member'
import { response } from 'src/utils/response'
import { EntityManager, UpdateResult } from 'typeorm'

import {
  UnableToGetShopInfo,
  UnableToUpdateShopInfo,
} from 'src/utils/response-code'

import {
  GetShopInfoType,
  UpdateShopInfoToDbParams,
  UpdateShopTobDbByIdType,
} from '../type/seller.type'
import { Shop } from 'src/db/entities/Shop'

import { PinoLogger } from 'nestjs-pino'
import dayjs from 'dayjs'
@Injectable()
export class ShopService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(ShopService.name)
  }

  getShopInfoHandler(getShopInfo: Promise<GetShopInfoType>) {
    return async (member: Member) => {
      const start = dayjs()
      const { id: memberId } = member

      const [shop, getShopInfoError] = await (await getShopInfo)(memberId)

      if (getShopInfoError != '') {
        return response(undefined, UnableToGetShopInfo, getShopInfoError)
      }

      this.logger.info(`Done getShopInfoHandler ${dayjs().diff(start)} ms`)
      return response(shop)
    }
  }

  updateShopInfoHandler(updateShopInfo: Promise<UpdateShopTobDbByIdType>) {
    return async (member: Member, params: UpdateShopInfoToDbParams) => {
      const start = dayjs()
      const { id: memberId } = member

      const updateShopInfoError = await (await updateShopInfo)(memberId, params)

      if (updateShopInfoError != '') {
        return response(undefined, UnableToUpdateShopInfo, updateShopInfoError)
      }

      this.logger.info(`Done updateShopInfoHandler ${dayjs().diff(start)} ms`)
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

  async InquiryUpdateShopByMemberIdFunc(
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
        `Done InquiryUpdateShopByMemberIdFunc ${dayjs().diff(start)} ms`,
      )
      return ''
    }
  }
}
