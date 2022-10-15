import { DiscountType } from 'src/db/entities/ProductPromotion'
import { Promotion } from 'src/db/entities/Promotion'
import { SelectQueryBuilder } from 'typeorm'

export type InsertProductPromotionParams = {
  productId: number,
  discountType: DiscountType,
  discount: number,
  isActive: boolean,
}

export type FilterPromotionParams = {
  name?: string,
  startDate?: Date,
  endDate?: Date,
  status?: string,
}

export type InsertPromotionParams = {
  name: string,
  startDate: Date,
  endDate: Date,
  products: InsertProductPromotionParams[],
}

export type InqueryPromotionFuncType = (
  shopId: number,
  params: FilterPromotionParams,
) => Promise<[SelectQueryBuilder<Promotion>, string]>

export type ValidatePromotionFuncType = (
  shopId: number,
  params: InsertPromotionParams,
  promotionId?: number
) => Promise<[boolean, string]>

export type InsertPromotionFuncType = (
  shopId: number,
  params: InsertPromotionParams,
) => Promise<[Promotion, string]>

export type UpdatePromotionFuncType = (
  shopId: number,
  promotionId: number,
  params: InsertPromotionParams,
) => Promise<[Promotion, string]>

export type DeletePromotionFuncType = (
  shopId: number,
  promotionId: number,
) => Promise<[Promotion, string]>
