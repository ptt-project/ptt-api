import { Injectable } from '@nestjs/common'
import dayjs from 'dayjs'
import { PinoLogger } from 'nestjs-pino'
import { Shop } from 'src/db/entities/Shop'
import { response } from 'src/utils/response'
import { CreatePromotionRequestDTO, GetPromotionQueryDTO } from '../dto/promotion'
import { DeletePromotionFuncType, FilterPromotionParams, InqueryPromotionFuncType, InsertPromotionFuncType, InsertPromotionParams, UpdatePromotionFuncType, ValidatePromotionFuncType } from '../type/promotion.type'
import { UnableToCreatePromotionError, UnableToDeletePromotionError, UnableToGetPromotionError, UnableToUpdatePromotionError, ValidatePromotionError } from 'src/utils/response-code'
import { Between, EntityManager, In, LessThan, Like, MoreThanOrEqual, Not, SelectQueryBuilder } from 'typeorm'
import { Promotion } from 'src/db/entities/Promotion'
import { Product } from 'src/db/entities/Product'
import { ProductPromotion } from 'src/db/entities/ProductPromotion'
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
      
      const { name, startDate, endDate, status } = params
      let promotionQuery: SelectQueryBuilder<Promotion>

      try {
        promotionQuery = etm.createQueryBuilder(Promotion, 'promotion')
        promotionQuery
        .leftJoinAndSelect("promotion.products", "productPromotion")
        .leftJoinAndSelect("productPromotion.product", "product")
        .leftJoinAndSelect("product.productProfile", "productProfile")
        let condition: any = { shopId, deletedAt: null }
        if (name) {
          condition.name = Like(`%${name}%`)
        }
        if (status == 'active') {
          condition.endDate = MoreThanOrEqual(new Date())
        } else if (status == 'expired') {
          condition.endDate = LessThan(new Date())
        }
        if (startDate && endDate) {
          condition = [
            { startDate: Between(startDate, endDate), ...condition },
            { endDate: Between(startDate, endDate), ...condition },
          ]
        }
        promotionQuery.where(condition)

      } catch (error) {
        return [promotionQuery, error.message]
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
      
      const { products, startDate, endDate } = params

      if (endDate <= startDate) {
        return [false, 'startDate must less than endDate']
      }

      let discountError = ''
      products.forEach((product) => {
        if (product.discountType == 'percentage' && ( product.discount <= 0 || product.discount >= 100) ) {
          discountError = 'discount in percentage must be more than 0 and less than 100'
        } else if (product.discountType == 'value' && product.discount <= 0) {
          discountError = 'discount in value must be more than 0'
        }
      })
      if  (discountError) {
        return [false, discountError]
      }

      const productIds = products.map(product => product.productId).sort()
      try {
        const productData = await etm.find(Product, {
          where: {
            id: In(productIds),
            shop: {
              id: shopId
            },
            deletedAt: null,
          }, 
          relations: ['shop']
        })

        if (productData.length !== productIds.length) {
          return [false, `${productIds.length - productData.length} products are not found`]
        }

        const profilePromoWhere: any = {
          productId: In(productIds),
          deletedAt: null,
        }

        if (promotionId) {
          profilePromoWhere.promotionId = Not(promotionId)
        }

        const propuctProfilePromotions = await etm.find(ProductPromotion, {
          where: profilePromoWhere,
          relations: ['promotion'],
        })

        const overlapedProductPromotion = propuctProfilePromotions.reduce(
          (overlaped, current) => {
            if (
              startDate >= current.promotion.startDate && startDate <= current.promotion.endDate ||
              endDate >= current.promotion.startDate && endDate <= current.promotion.endDate
            ) {
              overlaped[current.productId] = true
            }
            return overlaped
          }
        , {})

        if (Object.keys(overlapedProductPromotion).length) {
          return [false, `${Object.keys(overlapedProductPromotion).length} products are on another promotion in this period of time`]
        }

      } catch (error) {
        return [false, error.message]
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

        const products: Product[] = await etm.findByIds(
          Product,
          params.products.map(
            promotionProduct => promotionProduct.productId
          ),
          {
            where: {
              deletedAt: null,
            }
          }
        )

        if (products.length !== params.products.length) {
          return [null, 'Some of products are not found']
        }

        const productMap = products.reduce((mem, cur) => {
          return {...mem, [cur.id]: cur}
        }, {})

        const productPromotion = etm.create( ProductPromotion, params.products.map(
          productPromo => ({
            productId: productPromo.productId,
            discountType: productPromo.discountType,
            discount: productPromo.discount,
            isActive: productPromo.isActive,
            promotionId: promotion.id,
            price: productPromo.discountType === "percentage"
              ? productMap[productPromo.productId].price * ((100 - productPromo.discount) / 100)
              : productMap[productPromo.productId].price - productPromo.discount
          })
        ))
        await etm.save(productPromotion)

      } catch (error) {
        return [null, error.message]
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

        const products: Product[] = await etm.findByIds(
          Product,
          params.products.map(
            promotionProduct => promotionProduct.productId
          ),
          {
            where: {
              deletedAt: null,
            }
          }
        )

        if (products.length !== params.products.length) {
          return [null, 'Some of products are not found']
        }

        const productMap = products.reduce((mem, cur) => {
          return {...mem, [cur.id]: cur}
        }, {})

        const oldProductPromotion = await etm.find(ProductPromotion, {
          where: {
            promotionId,
          }
        })
        await etm.softRemove(oldProductPromotion)

        const productPromotion = etm.create( ProductPromotion, params.products.map(
          productPromo => ({
            productId: productPromo.productId,
            discountType: productPromo.discountType,
            discount: productPromo.discount,
            isActive: productPromo.isActive,
            promotionId: promotion.id,
            price: productPromo.discountType === "percentage"
              ? productMap[productPromo.productId].price * ((100 - productPromo.discount) / 100)
              : productMap[productPromo.productId].price - productPromo.discount
          })
        ))
        await etm.save(productPromotion)

      } catch (error) {
        return [null, error.message]
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

        const productPromotions = await etm.find(ProductPromotion, {
          where: {
            promotionId,
            deletedAt: null,
          }
        })

        await etm.softRemove(promotion)
        await etm.softRemove(productPromotions)

      } catch (error) {
        return [promotion, error.message]
      }
      
      this.logger.info(
        `Done InqueryPromotionFunc ${dayjs().diff(start)} ms`,
      )
      return [promotion, '']
    }
  }
}
