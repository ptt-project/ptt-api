import { Injectable } from '@nestjs/common'
import { response } from 'src/utils/response'
import dayjs from 'dayjs'
import { PinoLogger } from 'nestjs-pino'
import { Condition } from 'src/db/entities/Condition'
import { Shop } from 'src/db/entities/Shop'
import { EntityManager, Like, SelectQueryBuilder, UpdateResult } from 'typeorm'
import {
  UnableToConvertDataToShopSearchPage,
  UnableToExecuteInquiryShopFromDb,
  UnableToGetConditions,
  UnableToGetShopInfo,
  UnableToPreInquiryShopFromDb,
  UnableToUpdateShopInfo,
} from 'src/utils/response-code'
import { Member } from 'src/db/entities/Member'
import {
  ConvertDataToShopSearchPageFuncType,
  ExecutePreInquiryShopFromDbType,
  GetShopInfoType,
  PreInquiryShopBySearchKeywordFromDbFuncType,
  SearchShopResponseType,
  UpdateShopInfoToDbParams,
  UpdateShopTobDbByIdType,
} from '../type/shop.type'
import { InquiryConditionByShopIdType } from '../type/condition.type'
import { IPaginationMeta, paginate, Pagination } from 'nestjs-typeorm-paginate'
import { SearchShopsDTO } from '../dto/shop.dto'

@Injectable()
export class ShopService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(ShopService.name)
  }

  GetShopInfoHandler(inquiryShopByMemberId: Promise<GetShopInfoType>) {
    return async (member: Member) => {
      const start = dayjs()
      const { id: memberId } = member

      const [shop, getShopInfoError] = await (await inquiryShopByMemberId)(
        memberId,
      )

      if (
        getShopInfoError != '' &&
        getShopInfoError != 'Unable to get shop for this user'
      ) {
        return response(undefined, UnableToGetShopInfo, getShopInfoError)
      }

      this.logger.info(`Done GetShopInfoHandler ${dayjs().diff(start)} ms`)
      return response(shop ? shop : null)
    }
  }

  UpdateShopInfoHandler(
    updateShopByMemberId: Promise<UpdateShopTobDbByIdType>,
  ) {
    return async (member: Member, params: UpdateShopInfoToDbParams) => {
      const start = dayjs()
      const { id: memberId } = member

      const updateShopInfoError = await (await updateShopByMemberId)(
        memberId,
        params,
      )

      if (updateShopInfoError != '') {
        return response(undefined, UnableToUpdateShopInfo, updateShopInfoError)
      }

      this.logger.info(`Done UpdateShopInfoHandler ${dayjs().diff(start)} ms`)
      return response(undefined)
    }
  }

  GetConditionsHandler(
    inquiryConditionByShopId: Promise<InquiryConditionByShopIdType>,
  ) {
    return async (shop: Shop) => {
      const start = dayjs()

      const [condition, InquiryConditionByShopIdError] = await (
        await inquiryConditionByShopId
      )(shop.id)

      if (InquiryConditionByShopIdError != '') {
        return response(
          undefined,
          UnableToGetConditions,
          InquiryConditionByShopIdError,
        )
      }

      this.logger.info(`Done GetConditionsHandler ${dayjs().diff(start)} ms`)
      return response(condition)
    }
  }

  async InquiryShopByMemberIdFunc(
    etm: EntityManager,
  ): Promise<GetShopInfoType> {
    return async (memberId: string): Promise<[Shop, string]> => {
      const start = dayjs()
      let shop: Shop = null
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

  async InquiryConditionByShopIdFunc(
    etm: EntityManager,
  ): Promise<InquiryConditionByShopIdType> {
    return async (shopId: string): Promise<[Condition, string]> => {
      const start = dayjs()
      let condition: Condition
      try {
        condition = await etm.findOne(Condition, {
          where: { shopId, deletedAt: null },
        })
        if (!condition) {
          return [condition, 'Unable to get conditions for this shop']
        }
      } catch (error) {
        return [condition, error.message]
      }

      this.logger.info(
        `Done InquiryConditionByShopIdFunc ${dayjs().diff(start)} ms`,
      )
      return [condition, '']
    }
  }

  SearchShopsHandler(
    preInquiryShopBySearchKeywordFromDb: PreInquiryShopBySearchKeywordFromDbFuncType,
    executePreInquiryShopFromDb: ExecutePreInquiryShopFromDbType,
    convertDataToShopSearchPage: ConvertDataToShopSearchPageFuncType,
  ) {
    return async (query: SearchShopsDTO) => {
      const {
        limit,
        page,
        keyword,
      } = query
      const [
        shopQuery,
        errorPreInquiryShopFromDb,
      ] = preInquiryShopBySearchKeywordFromDb(
        keyword,
      )

      if (errorPreInquiryShopFromDb != '') {
        return response(
          undefined,
          UnableToPreInquiryShopFromDb,
          errorPreInquiryShopFromDb,
        )
      }

      const [
        paginateShop,
        errorExecuteInquiryShopFromDb,
      ] = await executePreInquiryShopFromDb(shopQuery, limit, page)

      if (errorExecuteInquiryShopFromDb != '') {
        return response(
          undefined,
          UnableToExecuteInquiryShopFromDb,
          errorExecuteInquiryShopFromDb,
        )
      }

      const [
        result,
        errorConvertDataToShopSearchPage,
      ] = convertDataToShopSearchPage(
        paginateShop,
      )
      if (errorConvertDataToShopSearchPage != '') {
        return response(
          undefined,
          UnableToConvertDataToShopSearchPage,
          errorConvertDataToShopSearchPage,
        )
      }

      return response(result)
    }
  }

  PreInquiryShopBySearchKeywordFromDb(
    etm: EntityManager,
  ): PreInquiryShopBySearchKeywordFromDbFuncType {
    return (keyword: string): [SelectQueryBuilder<Shop>, string] => {
      const start = dayjs()
      let shopQuery: SelectQueryBuilder<Shop>
      try {
        shopQuery = etm.createQueryBuilder(Shop, 'shop')
        .leftJoinAndSelect('shop.productProfiles', 'productProfiles')
        .where({
          shopName: Like(`%${keyword}%`),
          approvalStatus: 'approved',
          deletedAt: null,
        })
        
      } catch (error) {
        return [shopQuery, error.message]
      }

      this.logger.info(
        `Done SearchShopFromDbFunc ${dayjs().diff(start)} ms`,
      )
      return [shopQuery, '']
    }
  }

  ExecuteInquiryShopFromDbFunc(): ExecutePreInquiryShopFromDbType {
    return async (
      shopQuery: SelectQueryBuilder<Shop>,
      limit: number,
      page: number,
    ): Promise<[Pagination<Shop, IPaginationMeta>, string]> => {
      let paginateShop: Pagination<Shop, IPaginationMeta>
      try {
        paginateShop = await paginate<Shop>(
          shopQuery,
          {
            limit,
            page,
          },
        )
      } catch (error) {
        return [paginateShop, error.message]
      }

      return [paginateShop, '']
    }
  }

  ConvertDataToShopSearchPageFunc(): ConvertDataToShopSearchPageFuncType {
    return (
      paginateShop: Pagination<Shop, IPaginationMeta>,
    ): [Pagination<SearchShopResponseType, IPaginationMeta>, ''] => {
      try {
        const items = paginateShop.items.map(
          (shop: Shop) => {

            return {
              shopName: shop.shopName,
              productCount: shop.productProfiles.length,
              shopScore: shop.shopScore,
              replyRate: shop.replyRate,
              profileImagePath: shop.profileImagePath,
              replyTime: 0,
              following: 0,
              follower: 0,
            }
          },
        )

        return [{ ...paginateShop, items }, '']
      } catch (error) {
        return [undefined, error.message]
      }
    }
  }
}
