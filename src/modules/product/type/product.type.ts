import { Product } from 'src/db/entities/Product'
import { ProductOption } from 'src/db/entities/ProductOption'
import { ConditionType, ProductProfile, ProductProfileStatusType } from 'src/db/entities/ProductProfile'
import { Shop } from 'src/db/entities/Shop'
import { CreateProductProfileRequestDto } from '../dto/product.dto'

export type InsertProductProfileToDbParams = {
  name: string
  detail: string
  shopId: number
  platformCategoryId: number
  brandId?: number
  status: ProductProfileStatusType
  weight: number
  exp?: number
  condition?: ConditionType
  isSendLated?: boolean
  extraDay?: number
  videoLink?: string
  imageIds?: string[]
  width: number
  length: number
  height: number
  minPrice: number
  maxPrice: number
}

export type InsertProductOptionsToDbParams = {
  name: string
  productProfileId: number
  options: string[]
}

export type InsertProductsToDbParams = {
  sku?: string
  productProfileId: number
  option1?: string
  option2?: string
  price: number
  stock: number
  shop: Shop
}

export type UpdateProductProfileToDbParams = {
  name: string
  detail: string
  platformCategoryId: number
  brandId?: number
  weight: number
  exp?: number
  condition?: ConditionType
  isSendLated?: boolean
  extraDay?: number
  videoLink?: string
  imageIds?: string[]
  width: number
  length: number
  height: number
}


export type UpdateProductOptionsToDbParams = {
  id: number
  name: string
  options: string[]
}

export type UpdateProductsToDbParams = {
  id: number
  sku?: string
  productProfileId: number
  option1?: string
  option2?: string
  price: number
  stock: number
}

export type UpdateProductsToDbType = (
  params: UpdateProductsToDbParams,
) => Promise<string>

export type UpdateProductOptionsToDbType = (
  params: UpdateProductOptionsToDbParams,
) => Promise<string>

export type ValidateProductParamsFuncType = (
  shopId: number,
  params: CreateProductProfileRequestDto,
) => Promise<string>

export type InsertProductProfileToDbFuncType = (
  params: InsertProductProfileToDbParams,
) => Promise<[ProductProfile, string]>

export type InsertProductOptionsToDbFuncType = (
  params: InsertProductOptionsToDbParams[],
) => Promise<[ProductOption[], string]>

export type InsertProductsToDbFuncType = (
  params: InsertProductsToDbParams[],
) => Promise<[Product[], string]>

export type UpdateProductProfileToDbFuncType = (
  productProfileId: number,
  params: UpdateProductProfileToDbParams,
) => Promise<string>

export type InquiryProductProfileFromDbFuncType = (
  productProfileId: number,
) => Promise<[ProductProfile, string]>

export type InquiryProductProfileByProductProfileIdType = (
  produceProfileId: number,
) => Promise<[ProductProfile, string]>
    
export type InquiryProductOptionsByProductProfileIdType = (
  produceProfileId: number,
) => Promise<[ProductOption[], string]>

export type InquiryProductsByProductProfileIdType = (
  produceProfileId: number,
) => Promise<[Product[], string]>

export type DeleteProductProfileByProductProfileIdType = (
  produceProfile: ProductProfile,
) => Promise<string>
      
export type DeleteProductOptionsByProductProfileIdType = (
  produceProfileId: number,
) => Promise<string>

export type DeleteProductsByProductProfileIdType = (
  produceProfileId: number,
) => Promise<string>

export type DeleteProductByIdType = (
  produceProfileId: number[],
) => Promise<string>

export type DeleteProductOptionByIdType = (
  produceOptionId: number[],
) => Promise<string>

export type UpdateProductProfileStatusByProductProfileIdType = (
  produceProfileId: number,
  status:ProductProfileStatusType,
) => Promise<string>