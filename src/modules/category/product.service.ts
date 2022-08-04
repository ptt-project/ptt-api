import { Injectable } from '@nestjs/common'
import { response } from 'src/utils/response'
import { Double, EntityManager, In, SelectQueryBuilder } from 'typeorm'

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
import { Product } from 'src/db/entities/Product'

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

      console.log('query', params)
      const [
        products,
        errorInquiryProductByShopIdFunc,
      ] = await (await inquiryProductByShopId)(shop.id, params)

      if (errorInquiryProductByShopIdFunc != '') {
        response(
          undefined,
          UnableInquiryProductByShopIdFunc,
          errorInquiryProductByShopIdFunc,
        )
      }
      this.logger.info(
        `Done InquiryProductByShopIdFunc ${dayjs().diff(start)} ms`,
      )

      const result = await paginate<Product>(products, {
        limit,
        page,
      })
      return response(result)
    }
  }

  async InquiryProductByShopIdFunc(
    etm: EntityManager,
  ): Promise<InquiryProductByShopIdType> {
    return async (shopId: number, params: GetProductByShopIdQueryDTO) => {
      let products: SelectQueryBuilder<Product>

      try {
        products = etm
          .createQueryBuilder(Product, 'product')
          .innerJoin(
            'product.productProfile',
            'productProfile',
          )
          .where('product.deletedAt IS NULL')
          .andWhere('product.shopId = :shopId', {
            shopId,
          })

          if (params != undefined){
            if (params.productName != undefined) {
              const queryProductName: string = '%'+params.productName+'%'
              products.andWhere('productProfile.name ilike :queryProductName', { queryProductName })
            }
            
            if (params.minPrice != undefined) {
              const queryMinPrice: Double = params.minPrice
              products.andWhere('product.price >= :queryMinPrice', { queryMinPrice })
            }
            
            if (params.maxPrice != undefined) {
              const queryMaxPrice: Double = params.maxPrice
              products.andWhere('product.price <= :queryMaxPrice', { queryMaxPrice })
            }
          }
      } catch (error) {
        return [products, error]
      }

      return [products, '']
    }
  }
}
