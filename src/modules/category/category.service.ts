import { Injectable } from '@nestjs/common'
import { Member } from 'src/db/entities/Member'
import { response } from 'src/utils/response'
import { EntityManager } from 'typeorm'

import {
  UnableToCreateCategory,
  UnableToGetCategories,
  UnableToGetShopInfo
} from 'src/utils/response-code'

import {
  InqueryGetCategoryToDbType,
  InqueryInsertCategoryToDbType,
  InsertCategoryToDbParams,
} from './category.type'

import { PinoLogger } from 'nestjs-pino'
import dayjs from 'dayjs'
import { GetShopInfoType } from '../seller/seller.type'
import { Category } from 'src/db/entities/Category'
import { CreateCategoryRequestDto } from './dto/category.dto'

@Injectable()
export class CategoryService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(CategoryService.name)
  }
  
  getCategoriesHandler(
    getShopInfo: Promise<
      GetShopInfoType
    >,
    getCategories: Promise<
      InqueryGetCategoryToDbType
    >,
  ) {
    return async (member: Member) => {
      const start = dayjs()
      const { id: memberId } = member
      console.log('getCategoriesHandler')

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

      const [categories, getCategoriesError] = await (await getCategories)(
        shop.id,
      )

      if (getCategoriesError != '') {
        return response(
          undefined,
          UnableToGetCategories,
          getCategoriesError,
        )
      }

      this.logger.info(`Done getCategoriesHandler ${dayjs().diff(start)} ms`)
      return response(categories)
    }
  }

  createCategoryHandler(
    getShopInfo: Promise<
      GetShopInfoType
    >,
    getCategories: Promise<
      InqueryGetCategoryToDbType
    >,
    createCategory: Promise<
      InqueryInsertCategoryToDbType
    >,
  ) {
    return async (member: Member, params: CreateCategoryRequestDto) => {
      const start = dayjs()
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

      const [categories, getCategoriesError] = await (await getCategories)(
        shop.id,
      )

      if (getCategoriesError != '') {
        return response(
          undefined,
          UnableToGetCategories,
          getCategoriesError,
        )
      }

      const newCategory: InsertCategoryToDbParams = {
        name: params.name,
        createdBy: 'seller',
        shopId: shop.id,
        priority: categories.length + 1,
      }

      const [category, createCategoryError] = await (await createCategory)(
        newCategory,
      )

      if (createCategoryError != '') {
        return response(
          undefined,
          UnableToCreateCategory,
          createCategoryError,
        )
      }

      this.logger.info(`Done createCategoryHandler ${dayjs().diff(start)} ms`)
      return response(category)
    }
  }

  async InquiryGetCategoriesFunc(
    etm: EntityManager,
  ): Promise<InqueryGetCategoryToDbType> {
    return async (shopId: number): Promise<[Category[], string]> => {
      const start = dayjs()
      let categories: Category[]
      try {
        categories = await etm.find(Category, { where: { shopId, deletedAt: null } })
        if (!categories) {
          return [categories, 'Unable to get categories for this shop']
        }
      } catch (error) {
        return [categories, error]
      }

      this.logger.info(`Done InquiryGetCategoriesFunc ${dayjs().diff(start)} ms`)
      return [categories, '']
    }
  }

  async InquiryInsertCategoryFunc(
    etm: EntityManager,
  ): Promise<InqueryInsertCategoryToDbType> {
    return async (params: InsertCategoryToDbParams): Promise<[Category, string]> => {
      const start = dayjs()
      let category: Category
      try {
        const category= Category.create(params)
        await etm.save(category)
      } catch (error) {
        return [null, error]
      }

      this.logger.info(`Done InquiryInsertCategoryFunc ${dayjs().diff(start)} ms`)
      return [category, '']
    }
  }
}
