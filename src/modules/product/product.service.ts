import { Injectable } from '@nestjs/common'
import { response } from 'src/utils/response'
import { EntityManager, In } from 'typeorm'

import {
  UnableToCreateProductProfile,
  UnableToCreateProductOptions,
  UnableToCreateProducts,
  CreateProductValidationFailed,
  UnableToGetProducts,
  UnableInquiryProductProfileByProductProfileId,
  UnableUpdateStatusProductByProductProfileId,
  UnableInquiryProductsByProductProfileId,
  UnableDeleteProductsByProductProfileId,
  UnableDeleteProductOptionsByProductProfileId,
  UnableInquiryProductOptionsByProductProfileId,
  UnableDeleteProductProfileByProductProfileId,
} from 'src/utils/response-code'

import {
  InsertProductProfileToDbFuncType,
  InsertProductProfileToDbParams,
  InsertProductOptionsToDbFuncType,
  InsertProductOptionsToDbParams,
  InsertProductsToDbFuncType,
  InsertProductsToDbParams,
  ValidateProductParamsFuncType,
  InquiryProductProfileFromDbFuncType,
  InquiryProductProfileByProductProfileIdType,
  InquiryProductOptionsByProductProfileIdType,
  InquiryProductsByProductProfileIdType,
  DeleteProductProfileByProductProfileIdType,
  DeleteProductOptionsByProductProfileIdType,
  DeleteProductsByProductProfileIdType,
  UpdateProductProfileStatusByProductProfileIdType,
} from './product.type'
import { PinoLogger } from 'nestjs-pino'
import dayjs from 'dayjs'
import { CreateProductProfileRequestDto } from './dto/product.dto'
import { Shop } from 'src/db/entities/Shop'
import { ProductProfile, ProductProfileStatusType } from 'src/db/entities/ProductProfile'
import { ProductOption } from 'src/db/entities/ProductOption'
import { Product } from 'src/db/entities/Product'
import { internalSeverError } from 'src/utils/response-error'
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
    getProductProfile: Promise<
      InquiryProductProfileFromDbFuncType
    >,
  ) {
    return async (shop: Shop, params: CreateProductProfileRequestDto) => {
      const start = dayjs()

      const validateError = await (await validateParams)(shop.id, params)

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

      if (params.isMultipleOptions) {
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
                productProfileId: productProfile.id,
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
      } else {
        const newProducts: InsertProductsToDbParams[] = [
          {
            price: params.price,
            stock: params.stock,
            sku: params.sku,
            productProfileId: productProfile.id,
          }
        ]

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
      }

      const [savedProductProfile, getProductProfileError] = await (await getProductProfile)(
        productProfile.id,
      )

      if (getProductProfileError != '') {
        return response(
          undefined,
          UnableToGetProducts,
          getProductProfileError,
        )
      }

      this.logger.info(`Done createProductHandler ${dayjs().diff(start)} ms`)
      return response(savedProductProfile)
    }
  }

  async ValidateProductParamsFunc(
    etm: EntityManager,
  ): Promise<ValidateProductParamsFuncType> {
    return async (shopId: number, params: CreateProductProfileRequestDto): Promise<string> => {
      const start = dayjs()
      
      let error = ''
      let skus = []

      if (params.isMultipleOptions) {
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

        const skuNote = {}
        params.products.forEach(product => {
          if (product.sku){
            if (skuNote[product.sku]) {
              error = 'sku should be unique'
            }
            else {
              skus.push(product.sku)
              skuNote[product.sku] = true
            }
          }
        })
      } else {
        if (params.price === undefined) return 'price is required'
        if (params.stock === undefined) return 'stock is required'
        if (params.sku) {
          skus = [params.sku]
        }
      }
      if (error !== '') return error

      let products: Product[]
      try {
        products = await etm.find(Product, {
          where: {
            deletedAt: null,
            sku: In(skus),
            productProfile: {
              shopId,
            },
          },
          relations: ['productProfile']})
      } catch(error) {
        return error
      }

      if (products.length) {
        return `sku '${products.map(product => product.sku).join(', ')}' has been used in this shop`
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
        const filledSkuParams = params.map(product => ({...product, sku: product.sku || 'happyshoping-tmp-sku'}))
        const products = Product.create(filledSkuParams)
        savedProducts = await etm.save(products)
        for(const product of savedProducts){
          if (product.sku === 'happyshoping-tmp-sku') {
            product.sku = `sku-${product.id}`
          }
        }
        savedProducts = await etm.save(savedProducts)
      } catch (error) {
        return [null, error]
      }

      this.logger.info(`Done InsertProductsToDbFunc ${dayjs().diff(start)} ms`)
      return [savedProducts, '']
    }
  }

  async InquiryProductProfileFromDbFunc(
    etm: EntityManager,
  ): Promise<InquiryProductProfileFromDbFuncType> {
    return async (productProfileId: number): Promise<[ProductProfile, string]> => {
      const start = dayjs()
      let productProfile: ProductProfile[] = []
      try {
        productProfile = await etm.findByIds(ProductProfile, [productProfileId], {
          relations: ['products', 'productOptions']
        })
        console.log(productProfile[0].products)
      } catch (error) {
        return [null, error]
      }

      this.logger.info(`Done InquiryProductProfileFromDbFunc ${dayjs().diff(start)} ms`)
      return [productProfile[0], '']
    }
  }

  getProductByProductIdHandler(
    InquiryProductProfileByProductProfileId: Promise<InquiryProductProfileByProductProfileIdType>,
    InquiryProductOptionsByProductProfileId: Promise<InquiryProductOptionsByProductProfileIdType>,
    InquiryProductsByProductProfileId: Promise<InquiryProductsByProductProfileIdType>,
    ) {
    return async (productProfileId: number) => {
      const start = dayjs()
      const [productProfile, inquiryProductProfileByProductProfileIdError] = await (
        await InquiryProductProfileByProductProfileId
      )(productProfileId)

      if (inquiryProductProfileByProductProfileIdError != '') {
        return response(
          undefined,
          UnableInquiryProductProfileByProductProfileId,
          inquiryProductProfileByProductProfileIdError,
        )
      }

      const [productOptions, inquiryProductOptionsByProductProfileIdError] = await (
        await InquiryProductOptionsByProductProfileId
      )(productProfileId)

      if (inquiryProductOptionsByProductProfileIdError != '') {
        return response(
          undefined,
          UnableInquiryProductOptionsByProductProfileId,
          inquiryProductOptionsByProductProfileIdError,
        )
      }

      const [products, inquiryProductsByProductProfileIdError] = await (
        await InquiryProductsByProductProfileId
      )(productProfileId)

      if (inquiryProductsByProductProfileIdError != '') {
        return response(
          undefined,
          UnableInquiryProductsByProductProfileId,
          inquiryProductsByProductProfileIdError,
        )
      }

      this.logger.info(`Done getProductByProductIdHandler ${dayjs().diff(start)} ms`)
      const result = {
        productProfile: productProfile,
        productOptions: productOptions,
        products: products,
      }
      return response(result)
    }
  }

  async InquiryProductProfileByProductProfileIdFunc(
    etm: EntityManager,
  ): Promise<InquiryProductProfileByProductProfileIdType> {
    return async (productProfileId: number): Promise<[ProductProfile, string]> => {
      const start = dayjs()
      let produceProfile: ProductProfile

      try {
        produceProfile = await etm
          .getRepository(ProductProfile)
          .findOne(productProfileId, { withDeleted: false })
      } catch (error) {
        return [produceProfile, error]
      }

      if (!produceProfile) {
        return [produceProfile, 'Not found product profile']
      }

      this.logger.info(`Done InquiryProductProfileByProductProfileIdFunc ${dayjs().diff(start)} ms`)
      return [produceProfile, '']
    }
  }

  async InquiryProductOptionsByProductProfileIdFunc(
    etm: EntityManager,
  ): Promise<InquiryProductOptionsByProductProfileIdType> {
    return async (productProfileId: number): Promise<[ProductOption[], string]> => {
      const start = dayjs()
      let productOptions: ProductOption[]

      try {
        productOptions = await etm
          .getRepository(ProductOption)
          .find({where: { deletedAt: null, productProfileId }})
      } catch (error) {
        return [productOptions, error]
      }

      if (!productOptions) {
        return [productOptions, 'Not found product options']
      }

      this.logger.info(`Done InquiryProductOptionsByProductProfileIdFunc ${dayjs().diff(start)} ms`)
      return [productOptions, '']
    }
  }

  async InquiryProductsByProductProfileIdFunc(
    etm: EntityManager,
  ): Promise<InquiryProductsByProductProfileIdType> {
    return async (productProfileId: number): Promise<[Product[], string]> => {
      const start = dayjs()
      let products: Product[]

      try {
        products = await etm
          .getRepository(Product)
          .find({where: { deletedAt: null, productProfileId }})
      } catch (error) {
        return [products, error]
      }

      if (!products) {
        return [products, 'Not found products']
      }

      this.logger.info(`Done InquiryProductsByProductProfileIdFunc ${dayjs().diff(start)} ms`)
      return [products, '']
    }
  }

  deleteProductByProductIdHandler(
    InquiryProductProfileByProductProfileId: Promise<InquiryProductProfileByProductProfileIdType>,
    DeleteProductProfileById: Promise<DeleteProductProfileByProductProfileIdType>,
    DeleteProductOptionsById: Promise<DeleteProductOptionsByProductProfileIdType>,
    DeleteProductsById: Promise<DeleteProductsByProductProfileIdType>,
    ) {
    return async (productProfileId: number) => {
      const start = dayjs()
      const [productProfile, inquiryProductProfileByProductProfileIdError] = await (
        await InquiryProductProfileByProductProfileId
      )(productProfileId)

      if (inquiryProductProfileByProductProfileIdError != '') {
        return response(
          undefined,
          UnableInquiryProductProfileByProductProfileId,
          inquiryProductProfileByProductProfileIdError,
        )
      }

      const deleteProductProfileByIdError = await (
        await DeleteProductProfileById
      )(productProfile)

      if (deleteProductProfileByIdError != '') {
        return response(
          undefined,
          UnableDeleteProductProfileByProductProfileId,
          deleteProductProfileByIdError,
        )
      }

      const deleteProductOptionsByIdError = await (await DeleteProductOptionsById)(
        productProfileId, 
      )
      
      if (deleteProductOptionsByIdError != '') {
        return internalSeverError(
          UnableDeleteProductOptionsByProductProfileId,
          deleteProductOptionsByIdError,
        )
      }

      const deleteProductsByIdError = await (await DeleteProductsById)(
        productProfileId, 
      )
      
      if (deleteProductsByIdError != '') {
        return internalSeverError(
          UnableDeleteProductsByProductProfileId,
          deleteProductsByIdError,
        )
      }

      const result = {id: productProfileId}


      this.logger.info(`Done deleteProductByProductIdHandler ${dayjs().diff(start)} ms`)
      return response(result)
    }
  }

  async DeleteProductProfileByIdFunc(
    etm: EntityManager,
  ): Promise<DeleteProductProfileByProductProfileIdType> {
    return async (productProfile: ProductProfile): Promise<string> => {
      const start = dayjs()
      try {
        await etm
          .getRepository(ProductProfile)
          .softRemove(productProfile)
      } catch (error) {
        return error
      }
      this.logger.info(`Done DeleteProductProfileByIdFunc ${dayjs().diff(start)} ms`)
      return ''
    }
  }

  async DeleteProductOptionsByIdFunc(
    etm: EntityManager,
  ): Promise<DeleteProductOptionsByProductProfileIdType> {
    return async (productProfileId: number): Promise<string> => {
      const start = dayjs()
      try {
        await etm.update(ProductOption, {productProfileId}, {deletedAt:dayjs()})
      } catch (error) {
        return error
      }
      this.logger.info(`Done DeleteProductOptionsByIdFunc ${dayjs().diff(start)} ms`)
      return ''
    }
  }

  async DeleteProductsByIdFunc(
    etm: EntityManager,
  ): Promise<DeleteProductsByProductProfileIdType> {
    return async (productProfileId: number): Promise<string> => {
      const start = dayjs()
      try {
        await etm.update(Product, {productProfileId}, {deletedAt:dayjs()})
      } catch (error) {
        return error
      }
      this.logger.info(`Done DeleteProductsByIdFunc ${dayjs().diff(start)} ms`)
      return ''
    }
  }

  hiddenToggleProductHandler(
    InquiryProductProfileByProductProfileId: Promise<InquiryProductProfileByProductProfileIdType>,
    UpdateProductProfileStatusByProductProfileId: Promise<UpdateProductProfileStatusByProductProfileIdType>,
    ) {
    return async (productProfileId: number) => {
      const start = dayjs()
      const [productProfile, inquiryProductProfileByProductProfileIdError] = await (
        await InquiryProductProfileByProductProfileId
      )(productProfileId)

      if (inquiryProductProfileByProductProfileIdError != '') {
        return response(
          undefined,
          UnableInquiryProductProfileByProductProfileId,
          inquiryProductProfileByProductProfileIdError,
        )
      }

      let status: ProductProfileStatusType 
      if(productProfile.status == 'public'){
        status = 'hidden'
      } else if (productProfile.status == 'hidden'){
        status = 'public'
      }

      const UpdateStatusProductByProductProfileIdError = await (
        await UpdateProductProfileStatusByProductProfileId
      )(productProfileId, status)

      if (UpdateStatusProductByProductProfileIdError != '') {
        return response(
          undefined,
          UnableUpdateStatusProductByProductProfileId,
          UpdateStatusProductByProductProfileIdError,
        )
      } 

      const [productProfileResult, inquiryProductProfileByProductProfileIdResultError] = await (
        await InquiryProductProfileByProductProfileId
      )(productProfileId)

      if (inquiryProductProfileByProductProfileIdResultError != '') {
        return response(
          undefined,
          UnableInquiryProductProfileByProductProfileId,
          inquiryProductProfileByProductProfileIdResultError,
        )
      }

      this.logger.info(`Done hiddenToggleProductHandler ${dayjs().diff(start)} ms`)
      return response(productProfileResult)
    }
  }

  async UpdateProductProfileStatusByProductProfileIdFunc(
    etm: EntityManager,
  ): Promise<UpdateProductProfileStatusByProductProfileIdType> {
    return async (
      productProfileId : number, 
      status: ProductProfileStatusType,
    ): Promise<string> => {
      const start = dayjs()
      try {
        await etm
          .getRepository(ProductProfile)
          .update(productProfileId, { status})
      } catch (error) {
        return error
      }

      this.logger.info(
        `Done UpdateProductProfileStatusByProductProfileIdFunc ${dayjs().diff(start)} ms`,
      )
      return ''
    }
  }
}
