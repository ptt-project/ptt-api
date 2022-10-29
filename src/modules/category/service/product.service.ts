import { Injectable } from '@nestjs/common'
import { response } from 'src/utils/response'
import { EntityManager, In, SelectQueryBuilder } from 'typeorm'

import { UnableinquiryProductProfileByCatgoryIdFunc } from 'src/utils/response-code'

import {
  InquiryProductByCatgoryIdType,
  inquiryProductProfileIdsByCategoryIdType,
  InsertCategoryProductToDbType,
  DeleteCategoryProductToDbType,
  DeleteCategoryProductToDbByCategoryIdType,
} from '../type/category.type'

import { PinoLogger } from 'nestjs-pino'

import { paginate } from 'nestjs-typeorm-paginate'
import { getProductQueryDTO } from '../dto/product.dto'
import dayjs from 'dayjs'
import { CategoryProductProfile } from 'src/db/entities/CategoryProductProfile'
import { ProductProfile } from 'src/db/entities/ProductProfile'

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
    return async (categoryId: string, query: getProductQueryDTO) => {
      const start = dayjs()
      const { limit = 10, page = 1 } = query

      const [
        productProfiles,
        errorInquiryProductProfileByCatgoryIdFunc,
      ] = await (await inquiryProductProfileByCatgoryIdFunc)(categoryId)

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
    return async (categoryId: string) => {
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
      } catch (error) {
        return [productProfiles, error.message]
      }

      return [productProfiles, '']
    }
  }

  async insertCategoryProductToDbFunc(
    etm: EntityManager,
  ): Promise<InsertCategoryProductToDbType> {
    return async (categoryId: string, productProfileIds: string[]) => {
      const start = dayjs()
      try {
        const categoryProductProfiles = productProfileIds.map(
          (productProfileId: string) => {
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
    return async (categoryId: string) => {
      const start = dayjs()
      let productIds: string[]
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
        return [productIds, error.message]
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
    return async (categoryId: string, productProfileIds: string[]) => {
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
        return error.message
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
    return async (categoryId: string) => {
      const start = dayjs()
      try {
        const categoryProductProfiles = await etm.find(CategoryProductProfile, {
          where: { categoryId, deletedAt: null },
        })

        await etm.remove(categoryProductProfiles)
      } catch (error) {
        return error.message
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
