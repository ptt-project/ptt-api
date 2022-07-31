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
  UnableUpdateProductProfileByProductProfileId,
  UnableRemoveProductOptionByProductOptionId,
  UnableUpdateProductOption,
  UnableRemoveProductsById,
  UnableUpdateProduct,
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
  UpdateProductProfileToDbFuncType,
  UpdateProductProfileToDbParams,
  UpdateProductOptionsToDbParams,
  UpdateProductsToDbParams,
  DeleteProductByIdType,
  UpdateProductsToDbType,
  DeleteProductOptionByIdType,
  UpdateProductOptionsToDbType,
} from './product.type'
import { PinoLogger } from 'nestjs-pino'
import dayjs from 'dayjs'
import { CreateProductProfileRequestDto, UpdateProductProfileRequestDto } from './dto/product.dto'
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

  CreateProductHandler(
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
          else {
            const uniqueOption = [... new Set(cur.options)]
            if (uniqueOption.length !== cur.options.length) {
              return error = 'options in productOptions must be unique'
            }
          }
          return mem.length === 0
            ? cur.options.map(option => [option])
            : mem.reduce(
              (m, option) => ([...m, ...cur.options.map(e => [...option, e])]), []
            )
        }, [])

        if (error !== '') return error

        if (params.products.length > 50)
          return `products must not have more than 50 elements`
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
        const productProfile = etm.create(ProductProfile, params)
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
        const productOptions = etm.create(ProductOption, params)
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
        const products = etm.create(Product, filledSkuParams)
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

  GetProductByProductIdHandler(
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

  DeleteProductByProductIdHandler(
    inquiryProductProfileByProductProfileId: Promise<InquiryProductProfileByProductProfileIdType>,
    deleteProductProfileById: Promise<DeleteProductProfileByProductProfileIdType>,
    deleteProductOptionsById: Promise<DeleteProductOptionsByProductProfileIdType>,
    deleteProductsById: Promise<DeleteProductsByProductProfileIdType>,
    ) {
    return async (productProfileId: number) => {
      const start = dayjs()
      const [productProfile, inquiryProductProfileByProductProfileIdError] = await (
        await inquiryProductProfileByProductProfileId
      )(productProfileId)

      if (inquiryProductProfileByProductProfileIdError != '') {
        return response(
          undefined,
          UnableInquiryProductProfileByProductProfileId,
          inquiryProductProfileByProductProfileIdError,
        )
      }

      const deleteProductProfileByIdError = await (
        await deleteProductProfileById
      )(productProfile)

      if (deleteProductProfileByIdError != '') {
        return response(
          undefined,
          UnableDeleteProductProfileByProductProfileId,
          deleteProductProfileByIdError,
        )
      }

      const deleteProductOptionsByIdError = await (await deleteProductOptionsById)(
        productProfileId, 
      )
      
      if (deleteProductOptionsByIdError != '') {
        return internalSeverError(
          UnableDeleteProductOptionsByProductProfileId,
          deleteProductOptionsByIdError,
        )
      }

      const deleteProductsByIdError = await (await deleteProductsById)(
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

  HiddenToggleProductHandler(
    inquiryProductProfileByProductProfileId: Promise<InquiryProductProfileByProductProfileIdType>,
    updateProductProfileStatusByProductProfileId: Promise<UpdateProductProfileStatusByProductProfileIdType>,
    ) {
    return async (productProfileId: number) => {
      const start = dayjs()
      const [productProfile, inquiryProductProfileByProductProfileIdError] = await (
        await inquiryProductProfileByProductProfileId
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
        await updateProductProfileStatusByProductProfileId
      )(productProfileId, status)

      if (UpdateStatusProductByProductProfileIdError != '') {
        return response(
          undefined,
          UnableUpdateStatusProductByProductProfileId,
          UpdateStatusProductByProductProfileIdError,
        )
      } 

      const [productProfileResult, inquiryProductProfileByProductProfileIdResultError] = await (
        await inquiryProductProfileByProductProfileId
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
        await etm.update(ProductProfile,productProfileId, { status})
      } catch (error) {
        return error
      }

      this.logger.info(
        `Done UpdateProductProfileStatusByProductProfileIdFunc ${dayjs().diff(start)} ms`,
      )
      return ''
    }
  }

  UpdateProductHandler(
    validateParams: Promise<ValidateProductParamsFuncType>,
    inquiryProductProfileByProductProfileId: Promise<InquiryProductProfileByProductProfileIdType>,
    inquiryProductOptionsByProductProfileId: Promise<InquiryProductOptionsByProductProfileIdType>,
    inquiryProductsByProductProfileId: Promise<InquiryProductsByProductProfileIdType>,
    updateProductProfileByProductProfileId: Promise<UpdateProductProfileToDbFuncType>,
    updateProductByProductId: Promise<UpdateProductsToDbType>,
    updateProductOptionByProductOptionId: Promise<UpdateProductOptionsToDbType>,
    createProductOptions: Promise<InsertProductOptionsToDbFuncType>,
    createProducts: Promise<InsertProductsToDbFuncType>,
    deleteProductOptionsByProductProfileId: Promise<DeleteProductOptionsByProductProfileIdType>,
    deleteProductsByProductProfileId: Promise<DeleteProductsByProductProfileIdType>,
    removeProductByProductId: Promise<DeleteProductByIdType>,
    removeProductOptionByProductOptionId: Promise<DeleteProductOptionByIdType>,
  ) {
    return async (shop: Shop, productProfileId: number, params: UpdateProductProfileRequestDto) => {
      const start = dayjs()

      const validateError = await (await validateParams)(shop.id, params)

      if (validateError !== '') {
        return response(
          undefined,
          CreateProductValidationFailed,
          validateError,
        )
      }

      const [productProfile, inquiryProductProfileByProductProfileIdError] = await (
        await inquiryProductProfileByProductProfileId
      )(productProfileId)

      if (inquiryProductProfileByProductProfileIdError != '') {
        return response(
          undefined,
          UnableInquiryProductProfileByProductProfileId,
          inquiryProductProfileByProductProfileIdError,
        )
      }

      const [productOptions, inquiryProductOptionsByProductProfileIdError] = await (
        await inquiryProductOptionsByProductProfileId
      )(productProfileId)

      if (inquiryProductOptionsByProductProfileIdError != '') {
        return response(
          undefined,
          UnableInquiryProductOptionsByProductProfileId,
          inquiryProductOptionsByProductProfileIdError,
        )
      }

      const [products, inquiryProductsByProductProfileIdError] = await (
        await inquiryProductsByProductProfileId
      )(productProfileId)

      if (inquiryProductsByProductProfileIdError != '') {
        return response(
          undefined,
          UnableInquiryProductsByProductProfileId,
          inquiryProductsByProductProfileIdError,
        )
      }
      
      const newUpdateProductProfile: UpdateProductProfileToDbParams = {
        name: params.name,
        detail: params.detail,
        platformCategoryId: params.platformCategoryId,
        brandId: params.brandId,
        weight: params.weight,
        exp: params.exp ,
        condition: params.condition ,
        isSendLated: params.isSendLated ,
        extraDay: params.extraDay ,
        videoLink: params.videoLink ,
        imageIds: params.imageIds,
        width: params.width,
        length: params.length,
        height: params.height,
      }

      Object.keys(newUpdateProductProfile).forEach(key => newUpdateProductProfile[key] === undefined ? delete newUpdateProductProfile[key] : {});

      const updateProductProfileByProductProfileIdError = await (
        await updateProductProfileByProductProfileId
      )(productProfileId, newUpdateProductProfile)

      if (updateProductProfileByProductProfileIdError != '') {
        return response(
          undefined,
          UnableUpdateProductProfileByProductProfileId,
          updateProductProfileByProductProfileIdError,
        )
      }

      if (params.isMultipleOptions) {

        if (productOptions.length > 0){

          let newProductOptions: InsertProductOptionsToDbParams[] = []
          let updateProductOptions: UpdateProductOptionsToDbParams[] = []

          for(const productOption of params.productOptions){

            if(productOption.id == undefined) {
              newProductOptions.push({
                name: productOption.name,
                productProfileId: productProfileId,
                options: productOption.options  
              })
            } else {
              let found: boolean = false
              for(const currentProductOption of productOptions){
                if(productOption.id == currentProductOption.id){
                  found = true
                  if(productOption.name != currentProductOption.name 
                      || JSON.stringify(productOption.options) != JSON.stringify(currentProductOption.options)){
                    updateProductOptions.push({
                      id: productOption.id,
                      name: productOption.name,
                      options: productOption.options
                    })
                  }
                }
              }
              if(found == false) {
                return internalSeverError(
                  UnableInquiryProductOptionsByProductProfileId,
                  'Not found product options ',
                )
              }
            }
          }

          let removeProductOptions: number[] = []
          for(const currentProductOption of productOptions){
            let found: boolean = false
            for(const productOption of params.productOptions){
              if(productOption.id == undefined){
                continue
              }
              if(productOption.id == currentProductOption.id){
                found = true
                break
              } else {

              }
            }
            if(found == false){
              removeProductOptions.push(currentProductOption.id)
            }
          }

          const [createNewProductOptions, createNewProductOptionsError] = await (await createProductOptions)(
            newProductOptions,
          )
  
          if (createNewProductOptionsError != '') {
            return response(
              undefined,
              UnableToCreateProductOptions,
              createNewProductOptionsError,
            )
          }

          const removeProductOptionByProductOptionIdError = await (await removeProductOptionByProductOptionId)(
            removeProductOptions, 
          )
          if (removeProductOptionByProductOptionIdError != '') {
            return internalSeverError(
              UnableRemoveProductOptionByProductOptionId,
              removeProductOptionByProductOptionIdError,
            )
          }

          for(const updateProductOption of updateProductOptions){
            const updateProductOptionError = await (await updateProductOptionByProductOptionId)(
              updateProductOption
            )
            if (updateProductOptionError != '') {
              return internalSeverError(
                UnableUpdateProductOption,
                updateProductOptionError,
              )
            }
          }

        } else {
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
        }

        if (products.length > 0 ) {
          let newProducts: InsertProductsToDbParams[] = []
          let updateProducts: UpdateProductsToDbParams[] = []

          for(const product of params.products){

            if(product.id == undefined) {
              newProducts.push({
                sku: product.sku,
                productProfileId: productProfileId,
                option1: product.option1,
                option2: product.option2,
                price: product.price,
                stock: product.stock  
              })
            } else {
              let found: boolean = false
              for(const currentProduct of products){
                if(product.id == currentProduct.id){
                  found = true
                  if(product.option1 != currentProduct.option1 
                    || product.option2 != currentProduct.option2
                    || product.price != currentProduct.price
                    || product.stock != currentProduct.stock
                    || product.sku != currentProduct.sku
                  ) {
                    if((product.sku != undefined)){
                      updateProducts.push({
                        id: product.id,
                        sku: product.sku,
                        productProfileId: productProfileId,
                        option1: product.option1,
                        option2: product.option2,
                        price: product.price,
                        stock: product.stock  
                      })
                    } else {
                      updateProducts.push({
                        id: product.id,
                        sku: currentProduct.sku,
                        productProfileId: productProfileId,
                        option1: product.option1,
                        option2: product.option2,
                        price: product.price,
                        stock: product.stock  
                      })
                    }
                  }
                }
              }
              if(found == false) {
                return internalSeverError(
                  UnableInquiryProductsByProductProfileId,
                  'Not found products ',
                )
              }
            }
          }

          let removeProduct: number[] = []
          for(const currentProduct of products){
            let found: boolean = false
            for(const product of params.products){
              if(product.id == undefined){
                continue
              }
              if(product.id == currentProduct.id){
                found = true
                break
              } 
            }
            if(found == false){
              removeProduct.push(currentProduct.id)
            }
          }

          if(newProducts.length > 0){
            const [createNewProducts, createProductsError] = await (await createProducts)(
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

          if(removeProduct.length > 0){
            const removeProductsByIdError = await (await removeProductByProductId)(
              removeProduct, 
            )
            if (removeProductsByIdError != '') {
              return internalSeverError(
                UnableRemoveProductsById,
                removeProductsByIdError,
              )
            }
          }
          
          if(updateProducts.length > 0){
            for(const updateProduct of updateProducts){
              if (updateProduct.sku == undefined){
              }
              const updateProductError = await (await updateProductByProductId)(
                updateProduct
              )
              if (updateProductError != '') {
                return internalSeverError(
                  UnableUpdateProduct,
                  updateProductError,
                )
              }
            }
          }

        } else {
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

        }


      } else {
        if (productOptions.length > 0){
          const deleteProductOptionsByIdError = await (await deleteProductOptionsByProductProfileId)(
            productProfileId, 
          )
          if (deleteProductOptionsByIdError != '') {
            return internalSeverError(
              UnableDeleteProductOptionsByProductProfileId,
              deleteProductOptionsByIdError,
            )
          }
    
          const deleteProductsByIdError = await (await deleteProductsByProductProfileId)(
            productProfileId, 
          )
          if (deleteProductsByIdError != '') {
            return internalSeverError(
              UnableDeleteProductsByProductProfileId,
              deleteProductsByIdError,
            )
          }
        }

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

      const [productProfileResult, inquiryProductProfileByProductProfileIdResultError] = await (
        await inquiryProductProfileByProductProfileId
      )(productProfileId)

      if (inquiryProductProfileByProductProfileIdResultError != '') {
        return response(
          undefined,
          UnableInquiryProductProfileByProductProfileId,
          inquiryProductProfileByProductProfileIdResultError,
        )
      }

      const [productOptionsResult, inquiryProductOptionsByProductProfileIdResultError] = await (
        await inquiryProductOptionsByProductProfileId
      )(productProfileId)

      if (inquiryProductOptionsByProductProfileIdResultError != '') {
        return response(
          undefined,
          UnableInquiryProductOptionsByProductProfileId,
          inquiryProductOptionsByProductProfileIdResultError,
        )
      }

      const [productsResult, inquiryProductsByProductProfileIdResultError] = await (
        await inquiryProductsByProductProfileId
      )(productProfileId)

      if (inquiryProductsByProductProfileIdResultError != '') {
        return response(
          undefined,
          UnableInquiryProductsByProductProfileId,
          inquiryProductsByProductProfileIdResultError,
        )
      }

      this.logger.info(`Done getProductByProductIdHandler ${dayjs().diff(start)} ms`)
      const result = {
        productProfile: productProfileResult,
        productOptions: productOptionsResult,
        products: productsResult,
      }
      return response(result)
    }
  }

  async UpdateProductProfileByProductProfileIdFunc(
    etm: EntityManager,
  ): Promise<UpdateProductProfileToDbFuncType> {
    return async (
      productProfileId: number,
      params: UpdateProductProfileToDbParams
    ): Promise<string> => {
      const start = dayjs()

      try {
        await etm.update(ProductProfile, productProfileId, { ...params })
      } catch (error) {
        console.log(error)
        return error
      }
      this.logger.info(`Done UpdateProductProfileByProductProfileIdFunc ${dayjs().diff(start)} ms`)
      return ''
    }
  }

  async UpdateProductOptionsByProductOptionIdFunc(
    etm: EntityManager,
  ): Promise<UpdateProductProfileToDbFuncType> {
    return async (
      productProfileId: number,
      params: UpdateProductProfileToDbParams
    ): Promise<string> => {
      const start = dayjs()

      try {
        await etm.update(ProductProfile, productProfileId, { ...params })
      } catch (error) {
        return error
      }
      this.logger.info(`Done UpdateProductOptionsByProductOptionIdFunc ${dayjs().diff(start)} ms`)
      return ''
    }
  }

  async UpdateProductByProductIdFunc(
    etm: EntityManager,
  ): Promise<UpdateProductsToDbType> {
    return async (
      params: UpdateProductsToDbParams,
    ): Promise<string> => {
      const start = dayjs()

      try {
        await etm.update(Product, params.id, { ...params })
      } catch (error) {
        return error
      }
      this.logger.info(`Done UpdateProductByProductIdFunc ${dayjs().diff(start)} ms`)
      return ''
    }
  }

  async UpdateProductOptionByProductOptionIdFunc(
    etm: EntityManager,
  ): Promise<UpdateProductOptionsToDbType> {
    return async (
      params: UpdateProductOptionsToDbParams,
    ): Promise<string> => {
      const start = dayjs()

      try {
        await etm.update(ProductOption, params.id, { ...params })
      } catch (error) {
        return error
      }
      this.logger.info(`Done UpdateProductOptionByProductOptionIdFunc ${dayjs().diff(start)} ms`)
      return ''
    }
  }

  async RemoveProductByProductIdFunc(
    etm: EntityManager,
  ): Promise<DeleteProductByIdType> {
    return async (
      productId: number[],
    ): Promise<string> => {
      const start = dayjs()
      

      try {
        await etm.update(Product, productId, { deletedAt:dayjs() })
      } catch (error) {
        return error
      }
      this.logger.info(`Done RemoveProductByProductIdFunc ${dayjs().diff(start)} ms`)
      return ''
    }
  }

  async RemoveProductOptionByProductOptionIdFunc(
    etm: EntityManager,
  ): Promise<DeleteProductOptionByIdType> {
    return async (
      productOptionId: number[],
    ): Promise<string> => {
      const start = dayjs()

      try {
        await etm.update(ProductOption, productOptionId, { deletedAt:dayjs() })
      } catch (error) {
        return error
      }
      this.logger.info(`Done RemoveProductOptionByProductOptionIdFunc ${dayjs().diff(start)} ms`)
      return ''
    }
  }
}
