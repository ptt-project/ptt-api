import { Injectable } from '@nestjs/common'
import dayjs from 'dayjs'
import { PinoLogger } from 'nestjs-pino'
import { Shop } from 'src/db/entities/Shop'
import { response } from 'src/utils/response'
import { CreatePromotionRequestDTO, GetPromotionQueryDTO } from './dto/promotion'
import { DeletePromotionFuncType, FilterPromotionParams, InqueryPromotionFuncType, InsertPromotionFuncType, InsertPromotionParams, UpdatePromotionFuncType, ValidatePromotionFuncType } from './promotion.type'
import { UnableToCreatePromotionError, UnableToDeletePromotionError, UnableToGetPromotionError, UnableToUpdatePromotionError, ValidatePromotionError } from 'src/utils/response-code'
import { Between, EntityManager, In, Like, Not, SelectQueryBuilder } from 'typeorm'
import { Promotion } from 'src/db/entities/Promotion'
import { ProductProfile } from 'src/db/entities/ProductProfile'
import { ProductProfilePromotion } from 'src/db/entities/ProductProfilePromotion'
import { paginate } from 'nestjs-typeorm-paginate'
@Injectable()
export class PromotionService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(PromotionService.name)
  }

  GetShopPromotionHandler(
    getPromotion: Promise<InqueryPromotionFuncType>,
  ) {
    return async (shop: Shop, query: GetPromotionQueryDTO) => {
      const start = dayjs()

      const { limit, page } = query
      const [promotionQuery, getPromotionError] = await (await getPromotion)(
        shop.id,
        query,
      )

      if (getPromotionError != '') {
        return response(undefined, UnableToGetPromotionError, getPromotionError)
      }

      const result = await paginate<Promotion>(promotionQuery, { limit, page })

      this.logger.info(`Done GetShopPromotionHandler ${dayjs().diff(start)} ms`)
      return response(result)
    }
  }

  CreateShopPromotionHandler(
    validate: Promise<ValidatePromotionFuncType>,
    createPromotion: Promise<InsertPromotionFuncType>,
  ) {
    return async (shop: Shop, params: CreatePromotionRequestDTO) => {
      const start = dayjs()

      const [isValid, validateError] = await (await validate)(
        shop.id,
        params,
      )

      if (validateError != '') {
        return response(undefined, ValidatePromotionError, validateError)
      }

      const [promotion, createPromotionError] = await (await createPromotion)(
        shop.id,
        params,
      )

      if (createPromotionError != '') {
        return response(undefined, UnableToCreatePromotionError, createPromotionError)
      }

      this.logger.info(`Done CreateShopPromotionHandler ${dayjs().diff(start)} ms`)
      return response(promotion)
    }
  }

  UpdateShopPromotionHandler(
    validate: Promise<ValidatePromotionFuncType>,
    updatePromotion: Promise<UpdatePromotionFuncType>,
  ) {
    return async (shop: Shop, params: CreatePromotionRequestDTO, promotionId: number) => {
      const start = dayjs()

      const [isValid, validateError] = await (await validate)(
        shop.id,
        params,
        promotionId,
      )

      if (validateError != '') {
        return response(undefined, ValidatePromotionError, validateError)
      }

      const [promotion, createPromotionError] = await (await updatePromotion)(
        shop.id,
        promotionId,
        params,
      )

      if (createPromotionError != '') {
        return response(undefined, UnableToUpdatePromotionError, createPromotionError)
      }

      this.logger.info(`Done UpdateShopPromotionHandler ${dayjs().diff(start)} ms`)
      return response(promotion)
    }
  }

  DeleteShopPromotionHandler(
    deletePromotion: Promise<DeletePromotionFuncType>,
  ) {
    return async (shop: Shop, promotionId: number) => {
      const start = dayjs()

      const [promotion, deletePromotionError] = await (await deletePromotion)(
        shop.id,
        promotionId,
      )

      if (deletePromotionError != '') {
        return response(undefined, UnableToDeletePromotionError, deletePromotionError)
      }

      this.logger.info(`Done DeleteShopPromotionHandler ${dayjs().diff(start)} ms`)
      return response(promotion)
    }
  }

  async InqueryPromotionFunc(
    etm: EntityManager,
  ): Promise<InqueryPromotionFuncType> {
    return async (shopId: number, params: FilterPromotionParams): Promise<[SelectQueryBuilder<Promotion>, string]> => {
      const start = dayjs()
      
      const { name, startDate, endDate } = params
      let promotionQuery: SelectQueryBuilder<Promotion>

      try {
        promotionQuery = etm.createQueryBuilder(Promotion, 'promotion')
        promotionQuery
        .leftJoinAndSelect("promotion.productProfiles", "productProfilePromotion")
        let condition: any = { shopId, deletedAt: null }
        if (name) {
          condition.name = Like(`%${name}%`)
        }
        if (startDate && endDate) {
          condition = [
            { ...condition, startDate: Between(startDate, endDate) },
            { ...condition, endDate: Between(startDate, endDate) },
          ]
        }
        promotionQuery.where(condition)

      } catch (error) {
        return [promotionQuery, error]
      }
      
      this.logger.info(
        `Done InqueryPromotionFunc ${dayjs().diff(start)} ms`,
      )
      return [promotionQuery, '']
    }
  }

  async ValidatePromotionFunc(
    etm: EntityManager,
  ): Promise<ValidatePromotionFuncType> {
    return async (shopId: number, params: InsertPromotionParams, promotionId?: number): Promise<[boolean, string]> => {
      const start = dayjs()
      
      const { productProfiles, startDate, endDate } = params

      const productProfileIds = productProfiles.map(productProfile => productProfile.productProfileId).sort()
      try {
        const productProfileData = await etm.find(ProductProfile, {
          where: {
            id: In(productProfileIds),
            shopId,
            deletedAt: null,
          }
        })

        if (productProfileData.length !== productProfileIds.length) {
          return [false, `${productProfileIds.length - productProfileData.length} products are not found`]
        }

        const profilePromoWhere: any = {
          productProfileId: In(productProfileIds),
          deletedAt: null,
        }

        if (promotionId) {
          profilePromoWhere.promotionId = Not(promotionId)
        }

        const propuctProfilePromotions = await etm.find(ProductProfilePromotion, {
          where: profilePromoWhere,
          relations: ['promotion'],
        })

        const overlapedProductPromotion = propuctProfilePromotions.reduce(
          (overlaped, current) => {
            if (
              startDate >= current.promotion.startDate && startDate <= current.promotion.endDate ||
              endDate >= current.promotion.startDate && endDate <= current.promotion.endDate
            ) {
              overlaped[current.productProfileId] = true
            }
            return overlaped
          }
        , {})

        if (Object.keys(overlapedProductPromotion).length) {
          return [false, `${Object.keys(overlapedProductPromotion).length} products are on another promotion in this period of time`]
        }

      } catch (error) {
        return [false, error]
      }
      
      this.logger.info(
        `Done ValidatePromotionFunc ${dayjs().diff(start)} ms`,
      )
      return [true, '']
    }
  }

  async InsertPromotionFunc(
    etm: EntityManager,
  ): Promise<InsertPromotionFuncType> {
    return async (shopId: number, params: InsertPromotionParams): Promise<[Promotion, string]> => {
      const start = dayjs()
      let promotion: Promotion
      try {
        promotion = etm.create(Promotion, {
          name: params.name,
          startDate: params.startDate,
          endDate: params.endDate,
          shopId,
        })
        promotion = await etm.save(promotion)

        const productPromotion = etm.create( ProductProfilePromotion, params.productProfiles.map(
          productProfilePromo => ({
            productProfileId: productProfilePromo.productProfileId,
            discountType: productProfilePromo.discountType,
            discount: productProfilePromo.discount,
            limitToStock: productProfilePromo.isLimitToStock ? 1 : undefined,
            limitToBuy: productProfilePromo.isLimitToBuy ? 1 : undefined,
            isActive: productProfilePromo.isActive,
            promotionId: promotion.id
          })
        ))
        await etm.save(productPromotion)

      } catch (error) {
        return [null, error]
      }
      this.logger.info(
        `Done InsertPromotionFunc ${dayjs().diff(start)} ms`,
      )
      return [promotion, '']
    }
  }

  async UpdatePromotionFunc(
    etm: EntityManager,
  ): Promise<UpdatePromotionFuncType> {
    return async (shopId: number, promotionId: number, params: InsertPromotionParams): Promise<[Promotion, string]> => {
      const start = dayjs()
      let promotion: Promotion
      try {
        promotion = await etm.findOne(Promotion, {
          id: promotionId,
          shopId,
        })

        if (!promotion) {
          return [promotion, "promotion is not found"]
        }

        promotion.name = params.name
        promotion.startDate = params.startDate
        promotion.endDate = params.endDate
        promotion = await etm.save(promotion)
        const oldProductPromotion = await etm.find(ProductProfilePromotion, {
          where: {
            promotionId,
          }
        })
        await etm.softRemove(oldProductPromotion)

        const productPromotion = etm.create( ProductProfilePromotion, params.productProfiles.map(
          productProfilePromo => ({
            productProfileId: productProfilePromo.productProfileId,
            discountType: productProfilePromo.discountType,
            discount: productProfilePromo.discount,
            limitToStock: productProfilePromo.isLimitToStock ? 1 : undefined,
            limitToBuy: productProfilePromo.isLimitToBuy ? 1 : undefined,
            isActive: productProfilePromo.isActive,
            promotionId: promotion.id
          })
        ))
        await etm.save(productPromotion)

      } catch (error) {
        return [null, error]
      }
      this.logger.info(
        `Done UpdatePromotionFunc ${dayjs().diff(start)} ms`,
      )
      return [promotion, '']
    }
  }

  async DeletePromotionFunc(
    etm: EntityManager,
  ): Promise<DeletePromotionFuncType> {
    return async (shopId: number, promotionId: number): Promise<[Promotion, string]> => {
      const start = dayjs()
      
      let promotion: Promotion

      try {
        promotion = await etm.findOne(Promotion, {
          where: {
            id: promotionId,
            shopId,
            deletedAt: null,
          }
        })

        if (!promotion) {
          return [promotion, `Promotion ${promotionId} is not found`]
        }

        const productProfilePromotions = await etm.find(ProductProfilePromotion, {
          where: {
            promotionId,
            deletedAt: null,
          }
        })

        await etm.softRemove(promotion)
        await etm.softRemove(productProfilePromotions)

      } catch (error) {
        return [promotion, error]
      }
      
      this.logger.info(
        `Done InqueryPromotionFunc ${dayjs().diff(start)} ms`,
      )
      return [promotion, '']
    }
  }
}
