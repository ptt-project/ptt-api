import { Injectable } from '@nestjs/common'
import { Member } from 'src/db/entities/Member'
import { response } from 'src/utils/response'
import { EntityManager, UpdateResult } from 'typeorm'

import {
  UnableToGetShopInfo,
  UnableToUpdateShopInfo
} from 'src/utils/response-code'

import {
  GetShopInfoType,
  UpdateShopInfoToDbParams,
  UpdateShopTobDbByIdType,
} from './seller.type'
import { Shop } from 'src/db/entities/Shop'

@Injectable()
export class ShopService {
  getShopInfoHandler(
    getShopInfo: Promise<
      GetShopInfoType
    >,
  ) {
    return async (member: Member) => {
      const { id: memberId } = member

      const [shop, getShopInfoError] = await (await getShopInfo)(
        memberId,
      )

      if (getShopInfoError != '') {
        return response(
          undefined,
          UnableToGetShopInfo,
          getShopInfoError,
        )
      }

      return response(shop)
    }
  }

  updateShopInfoHandler(
    updateShopInfo: Promise<
      UpdateShopTobDbByIdType
    >,
  ) {
    return async (member: Member, params: UpdateShopInfoToDbParams) => {
      const { id: memberId } = member

      const updateShopInfoError = await (await updateShopInfo)(
        memberId,
        params,
      )

      if (updateShopInfoError != '') {
        return response(
          undefined,
          UnableToUpdateShopInfo,
          updateShopInfoError,
        )
      }

      return response(undefined)
    }
  }

  async InquiryShopByMemberIdFunc(
    etm: EntityManager,
  ): Promise<GetShopInfoType> {
    return async (memberId: number): Promise<[Shop, string]> => {
      let shop: Shop
      try {
        shop = await etm.findOne(Shop, { withDeleted: false, where: { memberId } })
      } catch (error) {
        return [shop, error]
      }

      return [shop, '']
    }
  }

  async InquiryUpdateShopByMemberIdFunc(
    etm: EntityManager,
  ): Promise<UpdateShopTobDbByIdType> {
    return async (memberId: number, params: UpdateShopInfoToDbParams): Promise<string> => {
      try {
        const result: UpdateResult = await etm.update(Shop, {memberId}, { ...params })
        if (result.raw === 0) {
          return 'Unable to update shop info'
        }
      } catch (error) {
        return error
      }

      return ''
    }
  }
}
