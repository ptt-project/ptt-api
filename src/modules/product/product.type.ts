import { Product } from 'src/db/entities/Product'
import { ProductOption } from 'src/db/entities/ProductOption'
import { ConditionType, ProductProfile, ProductProfileStatusType } from 'src/db/entities/ProductProfile'
import { CreateProductProfileRequestDto } from './dto/product.dto'

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
}

export type InsertProductOptionsToDbParams = {
  name: string
  productProfileId: number
  options: string[]
}

export type InsertProductsToDbParams = {
  sku: string
  productProfileId: number
  shopId: number
  platformCategoryId: number
  brandId?: number
  option1: string
  option2?: string
  price: number
  stock: number
}

export type ValidateProductParamsFuncType = (
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
