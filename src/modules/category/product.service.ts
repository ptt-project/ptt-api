import { Injectable } from '@nestjs/common'
import { response } from 'src/utils/response'
import { EntityManager, In, SelectQueryBuilder } from 'typeorm'

import { UnableInquiryProductByShopIdFunc, UnableinquiryProductProfileByCatgoryIdFunc } from 'src/utils/response-code'

import {
  InquiryProductByCatgoryIdType,
  inquiryProductProfileIdsByCategoryIdType,
  InsertCategoryProductToDbType,
  DeleteCategoryProductToDbType,
  DeleteCategoryProductToDbByCategoryIdType,
  InquiryProductByShopIdType,
} from './category.type'

import { PinoLogger } from 'nestjs-pino'

import { paginate } from 'nestjs-typeorm-paginate'
import { GetProductByShopIdQueryDTO, getProductQueryDTO } from './dto/product.dto'
import dayjs from 'dayjs'
import { CategoryProductProfile } from 'src/db/entities/CategoryProductProfile'
import { ProductProfile } from 'src/db/entities/ProductProfile'
import { Shop } from 'src/db/entities/Shop'

@Injectable()
export class ProductService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(ProductService.name)
  }

  inquiryProductProfileByCatgoryIdHandler(
    inquiryProductProfileByCatgoryIdFunc: Promise<
      InquiryProductByCatgoryIdType
    >,
  ) {
    return async (categoryId: number, query: getProductQueryDTO) => {
      const start = dayjs()
      const {q, limit = 10, page = 1 } = query

      const [
        productProfiles,
        errorInquiryProductProfileByCatgoryIdFunc,
      ] = await (await inquiryProductProfileByCatgoryIdFunc)(categoryId, q)

      if (errorInquiryProductProfileByCatgoryIdFunc != '') {
        response(
          undefined,
          UnableinquiryProductProfileByCatgoryIdFunc,
          errorInquiryProductProfileByCatgoryIdFunc,
        )
      }
      this.logger.info(
        `Done InquiryProductProfileByCatgoryIdFunc ${dayjs().diff(start)} ms`,
      )

      const result = await paginate<ProductProfile>(productProfiles, {
        limit,
        page,
      })
      return response(result)
    }
  }

  async inquiryProductProfileByCatgoryIdFunc(
    etm: EntityManager,
  ): Promise<InquiryProductByCatgoryIdType> {
    return async (categoryId: number, q: string) => {
      let productProfiles: SelectQueryBuilder<ProductProfile>

      try {
        productProfiles = etm
          .createQueryBuilder(ProductProfile, 'productProfiles')
          .innerJoin(
            'productProfiles.categoryProductProfiles',
            'categoryProductProfiles',
          )
          .where('productProfiles.deletedAt IS NULL')
          .andWhere('categoryProductProfiles.categoryId = :categoryId', {
            categoryId,
          })

          if (q != undefined) {
            const queryName: string = '%'+q+'%'
            productProfiles.andWhere('productProfiles.name ilike :queryName', { queryName })
          }
      } catch (error) {
        return [productProfiles, error]
      }

      return [productProfiles, '']
    }
  }

  async insertCategoryProductToDbFunc(
    etm: EntityManager,
  ): Promise<InsertCategoryProductToDbType> {
    return async (categoryId: number, productProfileIds: number[]) => {
      const start = dayjs()
      try {
        const categoryProductProfiles = productProfileIds.map(
          (productProfileId: number) => {
            return etm.create(CategoryProductProfile, {
              categoryId,
              productProfileId,
            })
          },
        )

        await etm.save(categoryProductProfiles)
      } catch (error) {
        return error.driverError.detail
      }

      this.logger.info(
        `Done InsertCategoryProductToDbFunc ${dayjs().diff(start)} ms`,
      )
      return ''
    }
  }

  async inquiryProductProfileIdsByCategoryIdFunc(
    etm: EntityManager,
  ): Promise<inquiryProductProfileIdsByCategoryIdType> {
    return async (categoryId: number) => {
      const start = dayjs()
      let productIds: number[]
      try {
        const categoryProductProfiles = await etm.find(CategoryProductProfile, {
          where: { categoryId },
        })

        productIds = categoryProductProfiles.map(
          (categoryProduct: CategoryProductProfile) => {
            return categoryProduct.productProfileId
          },
        )
      } catch (error) {
        return [productIds, error]
      }

      this.logger.info(
        `Done inquiryProductProfileIdsByCategoryIdFunc ${dayjs().diff(
          start,
        )} ms`,
      )
      return [productIds, '']
    }
  }

  async deleteCategoryProductToDb(
    etm: EntityManager,
  ): Promise<DeleteCategoryProductToDbType> {
    return async (categoryId: number, productProfileIds: number[]) => {
      const start = dayjs()
      try {
        const categoryProductProfiles = await etm.find(CategoryProductProfile, {
          where: {
            categoryId,
            productProfileId: In(productProfileIds),
          },
        })

        await etm.remove(categoryProductProfiles)
      } catch (error) {
        return error
      }

      this.logger.info(
        `Done DeleteCategoryProductToDb ${dayjs().diff(start)} ms`,
      )
      return ''
    }
  }

  async deleteCategoryProductToDbByCategoryIdFunc(
    etm: EntityManager,
  ): Promise<DeleteCategoryProductToDbByCategoryIdType> {
    return async (categoryId: number) => {
      const start = dayjs()
      try {
        const categoryProductProfiles = await etm.find(CategoryProductProfile, {
          where: { categoryId, deletedAt: null },
        })

        await etm.remove(categoryProductProfiles)
      } catch (error) {
        return error
      }

      this.logger.info(
        `Done DeleteCategoryProductToDbByCategoryIdFunc ${dayjs().diff(
          start,
        )} ms`,
      )
      return ''
    }
  }

  InquiryProductByShopIdHandler(
    inquiryProductByShopId: Promise<
      InquiryProductByShopIdType
    >,
  ) {
    return async (shop: Shop, params: GetProductByShopIdQueryDTO) => {
      const start = dayjs()
      const {limit = 10, page = 1 } = params

      const [
        productProfiles,
        errorInquiryProductByShopIdFunc,
      ] = await (await inquiryProductByShopId)(shop.id, params)

      if (errorInquiryProductByShopIdFunc != '') {
        response(
          undefined,
          UnableInquiryProductByShopIdFunc,
          errorInquiryProductByShopIdFunc,
        )
      }
      const result = await paginate<ProductProfile>(productProfiles, {
        limit,
        page,
      })

      this.logger.info(
        `Done paginate InquiryProductByShopIdFunc ${dayjs().diff(start)} ms`,
      )

      this.logger.info(
        `Done InquiryProductByShopIdHandler ${dayjs().diff(start)} ms`,
      )
      return response(result)
    }
  }

  async InquiryProductByShopIdFunc(
    etm: EntityManager,
  ): Promise<InquiryProductByShopIdType> {
    return async (shopId: number, params: GetProductByShopIdQueryDTO) => {
      const start = dayjs()
      let productProfile: SelectQueryBuilder<ProductProfile>

      
      try {
        productProfile = etm
          .createQueryBuilder(ProductProfile, 'productProfiles')
          .innerJoin(
            'productProfiles.products',
            'products',
          )
          .innerJoin(
            'productProfiles.categoryProductProfiles',
            'categoryProductProfiles',
          )
          .where('productProfiles.deletedAt IS NULL')
          .andWhere('productProfiles.shopId = :shopId', {
            shopId,
          })

          if (params != undefined){
            if (params.productName != undefined) {
              productProfile.andWhere('productProfiles.name ILIKE :queryProductName', { queryProductName: '%'+params.productName+'%' })
            }

            if (params.minPrice != undefined || params.maxPrice != undefined) {
              if(params.minPrice != undefined && params.maxPrice != undefined){
                productProfile.andWhere('productProfiles.id IN (SELECT products.productProfileId FROM products WHERE products.price >= :queryMinPrice AND products.price <= :queryMaxPrice)', { queryMinPrice: params.minPrice, queryMaxPrice: params.maxPrice })
              } else if (params.minPrice != undefined && params.maxPrice == undefined){
                productProfile.andWhere('productProfiles.id IN (SELECT products.productProfileId FROM products WHERE products.price >= :queryMinPrice)', { queryMinPrice: params.minPrice })
              } else {
                productProfile.andWhere('productProfiles.id IN (SELECT products.productProfileId FROM products WHERE products.price <= :queryMaxPrice)', { queryMaxPrice: params.maxPrice })
              }
            }

            if (params.categories != undefined) {
              const queryCategories:object = JSON.parse(params.categories)
              productProfile.andWhere('productProfiles.id IN (SELECT categoryProductProfiles.productProfileId FROM category_product_profiles WHERE categoryProductProfiles.id IN (:...queryCategories))', { queryCategories: JSON.parse(params.categories) })
            }
            
          }
      } catch (error) {
        return [productProfile, error]
      }

      this.logger.info(
        `Done InquiryProductByShopIdFunc ${dayjs().diff(start)} ms`,
      )

      return [productProfile, '']
    }
  }
}
