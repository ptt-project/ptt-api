import { Injectable } from '@nestjs/common'
import { response } from 'src/utils/response'
import { EntityManager, UpdateResult } from 'typeorm'

import {
  UnableToInsertCategory,
  UnableToGetCategories,
  UnableToGetCategoryByCategoryId,
  UnableToUpdateStatusCategory,
  UnableToUpdatePriorityCategory,
  UnableToOrdersIsInvalid,
  UnableDeleteCategoryToDb,
  UnableDeleteCategoryProductToDbByCategoryId,
  UnableInsertCategoryProductToDb,
  UnableUpdateCategoryToDb,
  UnableDeleteCategoryProductToDb,
  UnableinquiryProductProfileIdsByCategoryId,
  UnableInquiryCategoryByName,
  UnableToGetPlatformCategories,
} from 'src/utils/response-code'

import {
  InquiryCategoryByIdType,
  InquiryCategoryToDbType,
  InsertCategoryToDbType,
  InsertCategoryToDbParams,
  UpdateStatusCategoryToDbParams,
  UpdateStatusCategoryToDbType,
  UpdatePriorityCategoryToDbType,
  DeleteCategoryToDbType,
  DeleteCategoryProductToDbByCategoryIdType,
  UpdateCategoryParams,
  UpdateCategoryToDbType,
  InsertCategoryProductToDbType,
  DeleteCategoryProductToDbType,
  inquiryProductProfileIdsByCategoryIdType,
  InquiryCategoryByNameType,
  InquiryPlatformCategoryToDbType,
} from './category.type'

import { PinoLogger } from 'nestjs-pino'
import dayjs from 'dayjs'
import { Category } from 'src/db/entities/Category'
import {
  UpdateStatusCategoryRequestDto,
  CreateCategoryRequestDto,
  OrderingCategoryRequestDto,
  UpdateCategoryRequestDto,
} from './dto/category.dto'
import { Shop } from 'src/db/entities/Shop'
import { internalSeverError } from 'src/utils/response-error'
import { PlatformCategory } from 'src/db/entities/PlatformCategory'

@Injectable()
export class CategoryService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(CategoryService.name)
  }

  getPlatformCategoriesHandler(getPlatfoemCategories: Promise<InquiryPlatformCategoryToDbType>) {
    return async () => {
      const start = dayjs()

      const [categories, getCategoriesError] = await (await getPlatfoemCategories)()

      if (getCategoriesError != '') {
        return response(undefined, UnableToGetPlatformCategories, getCategoriesError)
      }

      this.logger.info(`Done getPlatformCategoriesHandler ${dayjs().diff(start)} ms`)
      return response(categories)
    }
  }

  getCategoriesHandler(getCategories: Promise<InquiryCategoryToDbType>) {
    return async (shop: Shop) => {
      const start = dayjs()

      const [categories, getCategoriesError] = await (await getCategories)(
        shop.id,
      )

      if (getCategoriesError != '') {
        return response(undefined, UnableToGetCategories, getCategoriesError)
      }

      this.logger.info(`Done getCategoriesHandler ${dayjs().diff(start)} ms`)
      return response(categories)
    }
  }

  createCategoryHandler(
    getCategories: Promise<InquiryCategoryToDbType>,
    insertCategory: Promise<InsertCategoryToDbType>,
  ) {
    return async (shop: Shop, params: CreateCategoryRequestDto) => {
      const start = dayjs()

      const [categories, getCategoriesError] = await (await getCategories)(
        shop.id,
      )

      if (getCategoriesError != '') {
        return response(undefined, UnableToGetCategories, getCategoriesError)
      }

      const newCategory: InsertCategoryToDbParams = {
        name: params.name,
        createdBy: 'seller',
        shopId: shop.id,
        priority: categories.length + 1,
      }

      const [category, insertCategoryError] = await (await insertCategory)(
        newCategory,
      )

      if (insertCategoryError != '') {
        return response(undefined, UnableToInsertCategory, insertCategoryError)
      }

      this.logger.info(`Done createCategoryHandler ${dayjs().diff(start)} ms`)
      return response(category)
    }
  }

  async InquiryPlatformCategoriesFunc(
    etm: EntityManager,
  ): Promise<InquiryPlatformCategoryToDbType> {
    return async (): Promise<[PlatformCategory[], string]> => {
      const start = dayjs()
      let categories: PlatformCategory[]
      try {
        categories = await etm.find(PlatformCategory, {
          where: { status: 'active', deletedAt: null },
        })
        if (!categories) {
          return [categories, 'Unable to get platform categories']
        }
      } catch (error) {
        return [categories, error]
      }

      this.logger.info(`Done InquiryPlatformCategoriesFunc ${dayjs().diff(start)} ms`)
      return [categories, '']
    }
  }

  async inquiryCategoriesFunc(
    etm: EntityManager,
  ): Promise<InquiryCategoryToDbType> {
    return async (shopId: number): Promise<[Category[], string]> => {
      const start = dayjs()
      let categories: Category[]
      try {
        categories = await etm.find(Category, {
          where: { shopId, deletedAt: null },
          order: { priority: 'ASC' },
        })
        if (!categories) {
          return [categories, 'Unable to get categories for this shop']
        }
      } catch (error) {
        return [categories, error]
      }

      this.logger.info(`Done inquiryCategoriesFunc ${dayjs().diff(start)} ms`)
      return [categories, '']
    }
  }

  async insertCategoryFunc(
    etm: EntityManager,
  ): Promise<InsertCategoryToDbType> {
    return async (
      params: InsertCategoryToDbParams,
    ): Promise<[Category, string]> => {
      const start = dayjs()
      let category: Category
      try {
        const category = etm.create(Category, params)
        await etm.save(category)
      } catch (error) {
        return [null, error]
      }

      this.logger.info(`Done insertCategoryFunc ${dayjs().diff(start)} ms`)
      return [category, '']
    }
  }

  updateStatusCategoryHandler(
    inquiryCategoryByCategoryId: Promise<InquiryCategoryByIdType>,
    updateActiveCategory: Promise<UpdateStatusCategoryToDbType>,
  ) {
    return async (
      categoryId: number,
      params: UpdateStatusCategoryRequestDto,
    ) => {
      const start = dayjs()

      const [category, getCategoryByCategoryIdError] = await (
        await inquiryCategoryByCategoryId
      )(categoryId)

      if (getCategoryByCategoryIdError != '') {
        return response(
          undefined,
          UnableToGetCategoryByCategoryId,
          getCategoryByCategoryIdError,
        )
      }

      const updateActiveCategoryError = await (await updateActiveCategory)(
        categoryId,
        params,
      )

      if (updateActiveCategoryError != '') {
        return response(
          undefined,
          UnableToUpdateStatusCategory,
          updateActiveCategoryError,
        )
      }

      const [categoryResult, getCategoryByCategoryIdResultError] = await (
        await inquiryCategoryByCategoryId
      )(categoryId)

      if (getCategoryByCategoryIdResultError != '') {
        return response(
          undefined,
          UnableToGetCategoryByCategoryId,
          getCategoryByCategoryIdResultError,
        )
      }

      this.logger.info(
        `Done updateStatusCategoryHandler ${dayjs().diff(start)} ms`,
      )
      return response(categoryResult)
    }
  }

  async inquiryCategoryByCategoryIdFunc(
    etm: EntityManager,
  ): Promise<InquiryCategoryByIdType> {
    return async (categoryId: number): Promise<[Category, string]> => {
      const start = dayjs()
      let category: Category

      try {
        category = await etm.findOne(Category, categoryId, {
          withDeleted: false,
        })
      } catch (error) {
        return [category, error]
      }

      if (!category) {
        return [category, 'Category id ' + categoryId + ' Not found']
      }

      this.logger.info(
        `Done inquiryCategoryByCategoryIdFunc ${dayjs().diff(start)} ms`,
      )
      return [category, '']
    }
  }

  async updateStatusCategoryFunc(
    etm: EntityManager,
  ): Promise<UpdateStatusCategoryToDbType> {
    return async (
      categoryId: number,
      params: UpdateStatusCategoryToDbParams,
    ): Promise<string> => {
      const start = dayjs()
      try {
        await etm.update(Category, categoryId, { ...params })
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
    inquiryCategoriesFunc: Promise<InquiryCategoryToDbType>,
    updatePriorityCategory: Promise<UpdatePriorityCategoryToDbType>,
  ) {
    return async (shop: Shop, params: OrderingCategoryRequestDto) => {
      const start = dayjs()

      const [categories, getCategoriesError] = await (
        await inquiryCategoriesFunc
      )(shop.id)

      if (getCategoriesError != '') {
        return response(undefined, UnableToGetCategories, getCategoriesError)
      }

      if (categories.length != params.orders.length) {
        return response(undefined, UnableToOrdersIsInvalid, 'orders is invalid')
      }

      let priority = 1
      for (const categoryId of params.orders) {
        const updatePriorityCategoryError = await (
          await updatePriorityCategory
        )(categoryId, priority)

        if (updatePriorityCategoryError != '') {
          return internalSeverError(
            UnableToUpdatePriorityCategory,
            updatePriorityCategoryError,
          )
        }
        priority++
      }

      const [categoriesResult, getCategoriesResultError] = await (
        await inquiryCategoriesFunc
      )(shop.id)

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
    return async (categoryId: number, priority: number): Promise<string> => {
      const start = dayjs()
      let updateResult: UpdateResult

      try {
        updateResult = await etm.update(Category, categoryId, { priority })
      } catch (error) {
        return error
      }

      if (updateResult.affected == 0) {
        return 'Category id ' + categoryId + ' Not found'
      }

      this.logger.info(
        `Done updatePriorityCategoryFunc ${dayjs().diff(start)} ms`,
      )
      return ''
    }
  }

  deleteCategoryHandler(
    inquiryCategoryById: Promise<InquiryCategoryByIdType>,
    deleteCatgoryToDb: Promise<DeleteCategoryToDbType>,
    deleteCategoryProductToDbByCategoryId: Promise<
      DeleteCategoryProductToDbByCategoryIdType
    >,
  ) {
    return async (categoryId: number) => {
      const start = dayjs()
      const [category, errorInquiryCategory] = await (
        await inquiryCategoryById
      )(categoryId)

      if (errorInquiryCategory != '') {
        return response(
          undefined,
          UnableToGetCategoryByCategoryId,
          errorInquiryCategory,
        )
      }

      const errorDeleteCategoryToDb = await (await deleteCatgoryToDb)(category)

      if (errorDeleteCategoryToDb != '') {
        return response(
          undefined,
          UnableDeleteCategoryToDb,
          errorInquiryCategory,
        )
      }

      const errorDeleteCategoryProductToDbByCategoryId = await (
        await deleteCategoryProductToDbByCategoryId
      )(categoryId)

      if (errorDeleteCategoryProductToDbByCategoryId != '') {
        if (errorDeleteCategoryToDb != '') {
          return response(
            undefined,
            UnableDeleteCategoryProductToDbByCategoryId,
            errorInquiryCategory,
          )
        }
      }

      this.logger.info(`Done DeleteCategoryHandler ${dayjs().diff(start)} ms`)
      return response({ id: category.id })
    }
  }

  async deleteCategoryToDbFunc(
    etm: EntityManager,
  ): Promise<DeleteCategoryToDbType> {
    return async (category: Category) => {
      const start = dayjs()
      try {
        await etm.softRemove(category)
      } catch (error) {
        return error
      }

      this.logger.info(`Done DeleteCategoryToDbFunc ${dayjs().diff(start)} ms`)
      return ''
    }
  }

  updateCategoryHandler(
    inquiryProductProfileIdsByCategoryId: Promise<
      inquiryProductProfileIdsByCategoryIdType
    >,
    deleteCategoryProductToDb: Promise<DeleteCategoryProductToDbType>,
    insertCategoryProductToDb: Promise<InsertCategoryProductToDbType>,
    inquiryCategoryByNameFunc: Promise<InquiryCategoryByNameType>,
    updateCategoryToDb: Promise<UpdateCategoryToDbType>,
    inquiryCategoryById: Promise<InquiryCategoryByIdType>,
  ) {
    return async (categoryId: number, body: UpdateCategoryRequestDto) => {
      const start = dayjs()
      const { name, productProfileIds } = body
      const [
        currentProductProfileIds,
        errorInquiryProductProfileIdsByCategoryId,
      ] = await (await inquiryProductProfileIdsByCategoryId)(categoryId)

      if (errorInquiryProductProfileIdsByCategoryId != '') {
        return response(
          undefined,
          UnableinquiryProductProfileIdsByCategoryId,
          errorInquiryProductProfileIdsByCategoryId,
        )
      }

      const removeProductProfileIds = currentProductProfileIds.filter(
        x => !productProfileIds.includes(x),
      )

      const newProductProfileIds = productProfileIds.filter(
        x => !currentProductProfileIds.includes(x),
      )

      const errorDeleteCategoryProductToDb = await (
        await deleteCategoryProductToDb
      )(categoryId, removeProductProfileIds)

      if (errorDeleteCategoryProductToDb != '') {
        return response(
          undefined,
          UnableDeleteCategoryProductToDb,
          errorDeleteCategoryProductToDb,
        )
      }

      const errorInsertCategoryProductToDb = await (
        await insertCategoryProductToDb
      )(categoryId, newProductProfileIds)

      if (errorInsertCategoryProductToDb != '') {
        return response(
          undefined,
          UnableInsertCategoryProductToDb,
          errorInsertCategoryProductToDb,
        )
      }

      const [categoryExist, errorInquiryCategoryByNameFunc] = await (
        await inquiryCategoryByNameFunc
      )(name)

      if (errorInquiryCategoryByNameFunc != '') {
        return response(
          undefined,
          UnableInquiryCategoryByName,
          errorInquiryCategoryByNameFunc,
        )
      }

      if (categoryExist && categoryExist.id !== categoryId) {
        return response(
          undefined,
          UnableInquiryCategoryByName,
          'This name is already exist ',
        )
      }

      const updateCategoryParams = {
        name,
        productCount: productProfileIds.length,
      }
      const errorUpdateCategoryToDb = await (await updateCategoryToDb)(
        categoryId,
        updateCategoryParams,
      )
      if (errorUpdateCategoryToDb != '') {
        return response(
          undefined,
          UnableUpdateCategoryToDb,
          errorUpdateCategoryToDb,
        )
      }

      const [category, getCategoryByCategoryIdError] = await (
        await inquiryCategoryById
      )(categoryId)

      if (getCategoryByCategoryIdError != '') {
        return response(
          undefined,
          UnableToGetCategoryByCategoryId,
          getCategoryByCategoryIdError,
        )
      }

      this.logger.info(`Done UpdateCategoryHandler ${dayjs().diff(start)} ms`)
      return response({ ...category, productProfileIds })
    }
  }

  async inquiryCategoryByNameFunc(
    etm: EntityManager,
  ): Promise<InquiryCategoryByNameType> {
    return async (name: string) => {
      const start = dayjs()
      let category: Category
      try {
        category = await etm.findOne(Category, { where: { name } })
      } catch (error) {
        return [category, error]
      }

      this.logger.info(
        `Done InquiryCategoryByNameFunc ${dayjs().diff(start)} ms`,
      )
      return [category, '']
    }
  }

  async updateCategoryToDbFunc(
    etm: EntityManager,
  ): Promise<UpdateCategoryToDbType> {
    return async (categoryId: number, params: UpdateCategoryParams) => {
      const start = dayjs()
      try {
        const result = await etm.update(Category, categoryId, { ...params })

        if (result.affected === 0) {
          return `Can't update category row affected is 0`
        }
      } catch (error) {
        return error
      }

      this.logger.info(`Done UpdateCategoryToDbFunc ${dayjs().diff(start)} ms`)
      return ''
    }
  }

  inquiryCategoryHandler(
    inquiryCategoryById: Promise<InquiryCategoryByIdType>,
    inquiryProductProfileIdsByCategoryId: Promise<
      inquiryProductProfileIdsByCategoryIdType
    >,
  ) {
    return async (categoryId: number) => {
      const start = dayjs()
      const [category, getCategoryByCategoryIdError] = await (
        await inquiryCategoryById
      )(categoryId)

      if (getCategoryByCategoryIdError != '') {
        return response(
          undefined,
          UnableToGetCategoryByCategoryId,
          getCategoryByCategoryIdError,
        )
      }

      const [
        productProfileIds,
        errorInquiryProductProfileIdsByCategoryId,
      ] = await (await inquiryProductProfileIdsByCategoryId)(categoryId)

      if (errorInquiryProductProfileIdsByCategoryId != '') {
        return response(
          undefined,
          UnableinquiryProductProfileIdsByCategoryId,
          errorInquiryProductProfileIdsByCategoryId,
        )
      }

      this.logger.info(`Done InquiryCategoryHandler ${dayjs().diff(start)} ms`)
      return response({ ...category, productProfileIds })
    }
  }
}
