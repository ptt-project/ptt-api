import { Injectable } from '@nestjs/common'
import { response } from 'src/utils/response'
import { EntityManager } from 'typeorm'

import {
  UnableToCreateProductProfile,
  UnableToCreateProductOptions,
  UnableToCreateProducts,
  CreateProductValidationFailed,
} from 'src/utils/response-code'

import {
  InsertProductProfileToDbFuncType,
  InsertProductProfileToDbParams,
  InsertProductOptionsToDbFuncType,
  InsertProductOptionsToDbParams,
  InsertProductsToDbFuncType,
  InsertProductsToDbParams,
  ValidateProductParamsFuncType,
} from './product.type'

import { PinoLogger } from 'nestjs-pino'
import dayjs from 'dayjs'
import { CreateProductProfileRequestDto } from './dto/product.dto'
import { Shop } from 'src/db/entities/Shop'
import { ProductProfile } from 'src/db/entities/ProductProfile'
import { ProductOption } from 'src/db/entities/ProductOption'
import { Product } from 'src/db/entities/Product'
import { randomStr } from 'src/utils/helpers'
import _ from 'lodash'

@Injectable()
export class ProductService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(ProductService.name)
  }

  createProductHandler(
    validateParams: Promise<
      ValidateProductParamsFuncType
    >,
    createProductProfile: Promise<
      InsertProductProfileToDbFuncType
    >,
    createProductOptions: Promise<
      InsertProductOptionsToDbFuncType
    >,
    createProducts: Promise<
      InsertProductsToDbFuncType
    >,
  ) {
    return async (shop: Shop, params: CreateProductProfileRequestDto) => {
      const start = dayjs()

      const validateError = await (await validateParams)(params)

      if (validateError !== '') {
        return response(
          undefined,
          CreateProductValidationFailed,
          validateError,
        )
      }

      const newProductProfile: InsertProductProfileToDbParams = {
        ...params,
        shopId: shop.id,
        status: 'hidden',
      }
      const [productProfile, createProductProfileError] = await (await createProductProfile)(
        newProductProfile
      )

      if (createProductProfileError != '') {
        return response(
          undefined,
          UnableToCreateProductProfile,
          createProductProfileError,
        )
      }

      const newProductOptions: InsertProductOptionsToDbParams[] = params.productOptions.map(
        pdo => ({...pdo, shopId: shop.id, productProfileId: productProfile.id})
        )

      const [productOptions, createProductOptionsError] = await (await createProductOptions)(
        newProductOptions,
      )

      if (createProductOptionsError != '') {
        return response(
          undefined,
          UnableToCreateProductOptions,
          createProductOptionsError,
        )
      }

      const newProducts: InsertProductsToDbParams[] = params.products.map(
        pd => {
            return {
              ...pd,
              shopId: shop.id,
              productProfileId: productProfile.id,
              platformCategoryId: params.platformCategoryId,
              sku: pd.sku || randomStr(10),
              brandId: params.brandId,
            }
          }
        )

      const [products, createProductsError] = await (await createProducts)(
        newProducts,
      )

      if (createProductsError != '') {
        return response(
          undefined,
          UnableToCreateProducts,
          createProductsError,
        )
      }

      this.logger.info(`Done createProductHandler ${dayjs().diff(start)} ms`)
      return response(productProfile)
    }
  }

  async ValidateProductParamsFunc(): Promise<ValidateProductParamsFuncType> {
    return async (params: CreateProductProfileRequestDto): Promise<string> => {
      const start = dayjs()
      
      let error = ''
      const productOptionsMetaData = params.productOptions.reduce((mem, cur) => {
        if (!cur.name) error = 'productOptions element must have "name" attribute'
        else if (!cur.options) error = 'productOptions element must have "options" attribute'
        else if (!Array.isArray(cur.options)) error = 'productOptions element must have "options" must be Array'
        else if (cur.options.length == 0) error = 'productOptions element must have "options" must not empty'
        return mem.length === 0
          ? cur.options.map(option => [option])
          : mem.reduce(
            (m, option) => ([...m, ...cur.options.map(e => [...option, e])]), []
          )
      }, [])

      if (error !== '') return error

      if (params.products.length !== productOptionsMetaData.length)
        return `products must have ${productOptionsMetaData.length} elements`

      if (!productOptionsMetaData.every(option => {
        const condition = option.reduce((mem, cur, index) => {
          mem[`option${index + 1}`] = cur
         return mem
        }, {});
        return !!_.find(params.products, condition)
      })) {
        return 'products elements are misssing for some options'
      }
      
      this.logger.info(`Done ValidateProductParamsFunc ${dayjs().diff(start)} ms`)
      return error
    }
  }

  async InsertProductProfileToDbFunc(
    etm: EntityManager,
  ): Promise<InsertProductProfileToDbFuncType> {
    return async (params: InsertProductProfileToDbParams): Promise<[ProductProfile, string]> => {
      const start = dayjs()
      let savedProductProfile: ProductProfile
      try {
        const productProfile = ProductProfile.create(params)
        savedProductProfile = await etm.save(productProfile)
      } catch (error) {
        return [null, error]
      }

      this.logger.info(`Done InsertProductProfileToDbFunc ${dayjs().diff(start)} ms`)
      return [savedProductProfile, '']
    }
  }

  async InsertProductOptionsToDbFunc(
    etm: EntityManager,
  ): Promise<InsertProductOptionsToDbFuncType> {
    return async (params: InsertProductOptionsToDbParams[]): Promise<[ProductOption[], string]> => {
      const start = dayjs()
      let savedProductOptions: ProductOption[]
      try {
        const productOptions = ProductOption.create(params)
        savedProductOptions = await etm.save(productOptions)
      } catch (error) {
        return [null, error]
      }

      this.logger.info(`Done InsertProductOptionsToDbFunc ${dayjs().diff(start)} ms`)
      return [savedProductOptions, '']
    }
  }
  async InsertProductsToDbFunc(
    etm: EntityManager,
  ): Promise<InsertProductsToDbFuncType> {
    return async (params: InsertProductsToDbParams[]): Promise<[Product[], string]> => {
      const start = dayjs()
      let savedProducts: Product[]
      try {
        const products = Product.create(params)
        savedProducts = await etm.save(products)
      } catch (error) {
        return [null, error]
      }

      this.logger.info(`Done InsertProductsToDbFunc ${dayjs().diff(start)} ms`)
      return [savedProducts, '']
    }
  }
}
