import { Product } from 'src/db/entities/Product'
import { ProductOption } from 'src/db/entities/ProductOption'
import {
  ConditionType,
  ProductProfile,
  ProductProfileStatusType,
} from 'src/db/entities/ProductProfile'
import { SelectQueryBuilder } from 'typeorm'
import {
  CreateProductProfileRequestDto,
  GetProductListDto,
} from '../dto/product.dto'

export type InsertProductProfileToDbParams = {
  name: string
  detail: string
  shopId: string
  platformCategoryId: string
  brandId?: string
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
}

export type InsertProductOptionsToDbParams = {
  name: string
  productProfileId: string
  options: string[]
}

export type InsertProductsToDbParams = {
  sku?: string
  productProfileId: string
  option1?: string
  option2?: string
  price: number
  stock: number
}

export type UpdateProductProfileToDbParams = {
  name: string
  detail: string
  platformCategoryId: string
  brandId?: string
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
  id: string
  name: string
  options: string[]
}

export type UpdateProductsToDbParams = {
  id: string
  sku?: string
  productProfileId: string
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
  shopId: string,
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
  productProfileId: string,
  params: UpdateProductProfileToDbParams,
) => Promise<string>

export type InquiryProductProfileFromDbFuncType = (
  productProfileId: string,
) => Promise<[ProductProfile, string]>

export type InquiryProductProfileByProductProfileIdType = (
  produceProfileId: string,
) => Promise<[ProductProfile, string]>

export type InquiryProductOptionsByProductProfileIdType = (
  produceProfileId: string,
) => Promise<[ProductOption[], string]>

export type InquiryProductsByProductProfileIdType = (
  produceProfileId: string,
) => Promise<[Product[], string]>

export type DeleteProductProfileByProductProfileIdType = (
  produceProfile: ProductProfile,
) => Promise<string>

export type DeleteProductOptionsByProductProfileIdType = (
  produceProfileId: string,
) => Promise<string>

export type DeleteProductsByProductProfileIdType = (
  produceProfileId: string,
) => Promise<string>

export type DeleteProductByIdType = (
  produceProfileId: string[],
) => Promise<string>

export type DeleteProductOptionByIdType = (
  produceOptionId: string[],
) => Promise<string>

export type UpdateProductProfileStatusByProductProfileIdType = (
  produceProfileId: string,
  status: ProductProfileStatusType,
) => Promise<string>

export type InquiryProductListByShopIdType = (
  shopId: string,
  query: GetProductListDto,
) => Promise<[SelectQueryBuilder<ProductProfile>, string]>
