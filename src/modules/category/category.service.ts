import { Injectable } from '@nestjs/common'
import { Member } from 'src/db/entities/Member'
import { response } from 'src/utils/response'
import { EntityManager } from 'typeorm'

import {
  UnableToCreateCategory,
  UnableToGetCategories,
  UnableToGetCategoryByCategoryId,
  UnableToGetShopInfo,
  UnableToUpdateActiveCategory,
  UnableToUpdatePriorityCategory
} from 'src/utils/response-code'

import {
  InqueryGetCategoryByCategoryIdToDbType,
  InqueryGetCategoryToDbType,
  InqueryInsertCategoryToDbType,
  InsertCategoryToDbParams,
  UpdateActiveCategoryToDbParams,
  UpdateActiveCategoryToDbType,
  UpdatePriorityCategoryToDbType,
} from './category.type'

import { PinoLogger } from 'nestjs-pino'
import dayjs from 'dayjs'
import { GetShopInfoType } from '../seller/seller.type'
import { Category } from 'src/db/entities/Category'
import { ActiveToggleRequestDto, CreateCategoryRequestDto, OrderingCategoryRequestDto } from './dto/category.dto'

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
        categories = await etm.find(Category, { where: { shopId, deletedAt: null }, order: { "priority": "ASC" } })
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

  activeToggleCategoryHandler(
    getCategoryByCategoryId: Promise<InqueryGetCategoryByCategoryIdToDbType>,
    updateActiveCategory: Promise<UpdateActiveCategoryToDbType>,
  ) {
    return async (categoryId: number, params: ActiveToggleRequestDto) => {
      const start = dayjs()

      const [category, getCategoryByCategoryIdError] = await (await getCategoryByCategoryId)(
        categoryId,
      )

      if (getCategoryByCategoryIdError != '') {
        return response(
          undefined,
          UnableToGetCategoryByCategoryId,
          getCategoryByCategoryIdError,
        )
      }

      const updateActiveCategoryError = await (await updateActiveCategory)(
        categoryId, params,
      )

      if (updateActiveCategoryError != '') {
        return response(
          undefined,
          UnableToUpdateActiveCategory,
          updateActiveCategoryError,
        )
      }

      this.logger.info(`Done activeToggleCategoryHandler ${dayjs().diff(start)} ms`)
      return response(undefined)

    }
  }

  async getCategoryByCategoryIdFunc(
    etm: EntityManager,
  ): Promise<InqueryGetCategoryByCategoryIdToDbType> {
    return async (categoryId: number): Promise<[Category, string]> => {
      const start = dayjs()
      let category: Category

      try {
        category = await etm
          .getRepository(Category)
          .findOne(categoryId, { withDeleted: false })
      } catch (error) {
        return [category, error]
      }

      if (!category) {
        return [category, 'Category id ' + categoryId + ' Not found']
      }

      this.logger.info(`Done getCategoryByCategoryIdFunc ${dayjs().diff(start)} ms`)
      return [category, '']
    }
  }

  async updateActiveCategoryFunc(
    etm: EntityManager,
  ): Promise<UpdateActiveCategoryToDbType> {
    return async (
      categoryId : number, 
      params: UpdateActiveCategoryToDbParams,
    ): Promise<string> => {
      const start = dayjs()
      try {
        await etm
          .getRepository(Category)
          .update(categoryId, { ...params})
      } catch (error) {
        return error
      }

      this.logger.info(
        `Done updateActiveCategoryFunc ${dayjs().diff(start)} ms`,
      )
      return ''
    }
  }


  orderingCategoryHandler(
    getCategoryByCategoryId: Promise<InqueryGetCategoryByCategoryIdToDbType>,
    updatePriorityCategory: Promise<UpdatePriorityCategoryToDbType>
  ) {
    return async (params: OrderingCategoryRequestDto) => {
      const start = dayjs()

      for(const categoryId of params.orders){
        const [category, getCategoryByCategoryIdError] = await (await getCategoryByCategoryId)(
          categoryId,
        )
  
        if (getCategoryByCategoryIdError != '') {
          return response(
            undefined,
            UnableToGetCategoryByCategoryId,
            getCategoryByCategoryIdError,
          )
        }
      }

      let priority = 1

      for(const categoryId of params.orders){
        const updatePriorityCategoryError = await (await updatePriorityCategory)(
          categoryId, priority, 
        )
  
        if (updatePriorityCategoryError != '') {
          return response(
            undefined,
            UnableToUpdatePriorityCategory,
            updatePriorityCategoryError,
          )
        }
        
        priority++
      }

      this.logger.info(`Done orderingCategoryHandler ${dayjs().diff(start)} ms`)
      return response(undefined)

    }
  }

  async updatePriorityCategoryFunc(
    etm: EntityManager,
  ): Promise<UpdatePriorityCategoryToDbType> {
    return async (
      categoryId : number, 
      priority: number,
    ): Promise<string> => {
      const start = dayjs()
      try {
        await etm
          .getRepository(Category)
          .update(categoryId, {priority})
      } catch (error) {
        return error
      }

      this.logger.info(
        `Done updatePriorityCategoryFunc ${dayjs().diff(start)} ms`,
      )
      return ''
    }
  }

}
