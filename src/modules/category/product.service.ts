import { Injectable } from '@nestjs/common'
import { response } from 'src/utils/response'
import { EntityManager, In, SelectQueryBuilder } from 'typeorm'

import { UnableInquiryProductByCatgoryIdFunc } from 'src/utils/response-code'

import {
  InquiryProductByCatgoryIdType,
  InquiryProductIdsByCategoryIdType,
  InsertCategoryProductToDbType,
  DeleteCategoryProductToDbType,
  DeleteCategoryProductToDbByCategoryIdType,
} from './category.type'

import { PinoLogger } from 'nestjs-pino'

import { Product } from 'src/db/entities/Product'
import { paginate } from 'nestjs-typeorm-paginate'
import { getProductQueryDTO } from './dto/product.dto'
import dayjs from 'dayjs'
import { CategoryProduct } from 'src/db/entities/CategoryProduct'

@Injectable()
export class ProductService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(ProductService.name)
  }

  inquiryProductByCatgoryIdHandler(
    inquiryProductByCatgoryIdFunc: Promise<InquiryProductByCatgoryIdType>,
  ) {
    return async (categoryId: number, query: getProductQueryDTO) => {
      const start = dayjs()
      const { limit = 10, page = 1 } = query

      const [products, errorInquiryProductByCatgoryIdFunc] = await (
        await inquiryProductByCatgoryIdFunc
      )(categoryId)

      if (errorInquiryProductByCatgoryIdFunc != '') {
        response(
          undefined,
          UnableInquiryProductByCatgoryIdFunc,
          errorInquiryProductByCatgoryIdFunc,
        )
      }
      this.logger.info(
        `Done InquiryProductByCatgoryIdFunc ${dayjs().diff(start)} ms`,
      )

      const result = await paginate<Product>(products, { limit, page })
      return response(result)
    }
  }

  async inquiryProductByCatgoryIdFunc(
    etm: EntityManager,
  ): Promise<InquiryProductByCatgoryIdType> {
    return async (categoryId: number) => {
      let products: SelectQueryBuilder<Product>

      try {
        products = etm
          .createQueryBuilder(Product, 'products')
          .innerJoin('products.categoryProducts', 'categoryProducts')
          .innerJoinAndMapOne(
            'products.productProfile',
            'products.productProfile',
            'productProfiles',
          )
          .where('products.deletedAt IS NULL')
          .andWhere('categoryProducts.categoryId = :categoryId', { categoryId })
      } catch (error) {
        return [products, error]
      }

      return [products, '']
    }
  }

  async insertCategoryProductToDbFunc(
    etm: EntityManager,
  ): Promise<InsertCategoryProductToDbType> {
    return async (categoryId: number, productIds: number[]) => {
      const start = dayjs()
      try {
        const categoryProducts = productIds.map((productId: number) => {
          return CategoryProduct.create({
            categoryId,
            productId,
          })
        })

        await etm.save(categoryProducts)
      } catch (error) {
        return error
      }

      this.logger.info(
        `Done InsertCategoryProductToDbFunc ${dayjs().diff(start)} ms`,
      )
      return ''
    }
  }

  async inquiryProductIdsByCategoryIdFunc(
    etm: EntityManager,
  ): Promise<InquiryProductIdsByCategoryIdType> {
    return async (categoryId: number) => {
      const start = dayjs()
      let productIds: number[]
      try {
        const categoryProducts = await etm.find(CategoryProduct, {
          where: { categoryId },
        })

        productIds = categoryProducts.map(
          (categoryProduct: CategoryProduct) => {
            return categoryProduct.productId
          },
        )
      } catch (error) {
        return [productIds, error]
      }

      this.logger.info(
        `Done InquiryProductIdsByCategoryIdFunc ${dayjs().diff(start)} ms`,
      )
      return [productIds, '']
    }
  }

  async deleteCategoryProductToDb(
    etm: EntityManager,
  ): Promise<DeleteCategoryProductToDbType> {
    return async (categoryId: number, productIds: number[]) => {
      const start = dayjs()
      try {
        const categoryProducts = await etm.find(CategoryProduct, {
          where: {
            categoryId,
            productId: In(productIds),
          },
        })

        await etm.remove(categoryProducts)
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
        const categoryProducts = await etm.find(CategoryProduct, {
          where: { categoryId, deletedAt: null },
        })

        await etm.remove(categoryProducts)
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
}
