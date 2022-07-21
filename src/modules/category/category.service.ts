import { Injectable } from '@nestjs/common'
import { response } from 'src/utils/response'
import { EntityManager, UpdateResult } from 'typeorm'

import {
  UnableToCreateCategory,
  UnableToGetCategories,
  UnableToGetCategoryByCategoryId,
  UnableToUpdateStatusCategory,
  UnableToUpdatePriorityCategory,
  UnableToOrdersIsInvalid,
} from 'src/utils/response-code'

import {
  InqueryGetCategoryByCategoryIdToDbType,
  InqueryGetCategoryToDbType,
  InqueryInsertCategoryToDbType,
  InsertCategoryToDbParams,
  UpdateStatusCategoryToDbParams,
  UpdateStatusCategoryToDbType,
  UpdatePriorityCategoryToDbType,
} from './category.type'

import { PinoLogger } from 'nestjs-pino'
import dayjs from 'dayjs'
import { Category } from 'src/db/entities/Category'
import { UpdateStatusCategoryRequestDto, CreateCategoryRequestDto, OrderingCategoryRequestDto } from './dto/category.dto'
import { Shop } from 'src/db/entities/Shop'
import { internalSeverError } from 'src/utils/response-error'

@Injectable()
export class CategoryService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(CategoryService.name)
  }
  
  getCategoriesHandler(
    getCategories: Promise<
      InqueryGetCategoryToDbType
    >,
  ) {
    return async (shop: Shop) => {
      const start = dayjs()

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
    getCategories: Promise<
      InqueryGetCategoryToDbType
    >,
    createCategory: Promise<
      InqueryInsertCategoryToDbType
    >,
  ) {
    return async (shop: Shop, params: CreateCategoryRequestDto) => {
      const start = dayjs()

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

  updateStatusCategoryHandler(
    getCategoryByCategoryId: Promise<InqueryGetCategoryByCategoryIdToDbType>,
    updateActiveCategory: Promise<UpdateStatusCategoryToDbType>,
  ) {
    return async (categoryId: number, params: UpdateStatusCategoryRequestDto) => {
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
          UnableToUpdateStatusCategory,
          updateActiveCategoryError,
        )
      }

      const [categoryResult, getCategoryByCategoryIdResultError] = await (await getCategoryByCategoryId)(
        categoryId,
      )

      if (getCategoryByCategoryIdResultError != '') {
        return response(
          undefined,
          UnableToGetCategoryByCategoryId,
          getCategoryByCategoryIdResultError,
        )
      }

      this.logger.info(`Done updateStatusCategoryHandler ${dayjs().diff(start)} ms`)
      return response(categoryResult)

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

  async updateStatusCategoryFunc(
    etm: EntityManager,
  ): Promise<UpdateStatusCategoryToDbType> {
    return async (
      categoryId : number, 
      params: UpdateStatusCategoryToDbParams,
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
        `Done updateStatusCategoryFunc ${dayjs().diff(start)} ms`,
      )
      return ''
    }
  }


  orderingCategoryHandler(
    getCategories: Promise<InqueryGetCategoryToDbType>,
    updatePriorityCategory: Promise<UpdatePriorityCategoryToDbType>
  ) {
    return async (shop: Shop, params: OrderingCategoryRequestDto) => {
      const start = dayjs()

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

      if(categories.length != params.orders.length){
        return response(
          undefined,
          UnableToOrdersIsInvalid,
          'orders is invalid',
        )
      }

      let priority = 1
      for(const categoryId of params.orders){
        const updatePriorityCategoryError = await (await updatePriorityCategory)(
          categoryId, priority, 
        )
        
        if (updatePriorityCategoryError != '') {
          return internalSeverError(
            UnableToUpdatePriorityCategory,
            updatePriorityCategoryError,
          )
        }
        priority++
      }

      const [categoriesResult, getCategoriesResultError] = await (await getCategories)(
        shop.id,
      )

      if (getCategoriesResultError != '') {
        return response(
          undefined,
          UnableToGetCategories,
          getCategoriesResultError,
        )
      }

      this.logger.info(`Done orderingCategoryHandler ${dayjs().diff(start)} ms`)
      return response(categoriesResult)

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
      let updateResult: UpdateResult

      try {
        updateResult = await etm
          .getRepository(Category)
          .update(categoryId, {priority})
      } catch (error) {
        return error
      }

      if(updateResult.affected == 0){
        return 'Category id ' + categoryId + ' Not found'
      }

      this.logger.info(
        `Done updatePriorityCategoryFunc ${dayjs().diff(start)} ms`,
      )
      return ''
    }
  }

}
