import { FlashSale, StatusType } from 'src/db/entities/FlashSale'
import { DiscountType } from 'src/db/entities/FlashSaleProduct'
import { SelectQueryBuilder } from 'typeorm'

export type InsertFlashSaleProductParams = {
  productId: number,
  discountType: DiscountType,
  discount: number,
  limitToStock?: number,
  limitToBuy?: number,
  isActive: boolean,
}

export type FilterFlashSaleParams = {
  date?: Date,
  status?: string,
}

export type InsertFlashSaleParams = {
  roundId: number,
  status?: StatusType,
  products: InsertFlashSaleProductParams[],
}

export type InquiryFlashSaleFuncType = (
  shopId: number,
  params: FilterFlashSaleParams,
) => Promise<[SelectQueryBuilder<FlashSale>, string]>

export type RoundOptions = {
    value: number,
    label: string,
}

export type InquiryFlashSaleRoundFuncType = (
  date: Date,
) => Promise<[RoundOptions[], string]>

export type ValidateFlashSaleFuncType = (
  shopId: number,
  params: InsertFlashSaleParams,
  flashSaleId?: number,
) => Promise<[boolean, string]>

export type InsertFlashSaleFuncType = (
  shopId: number,
  params: InsertFlashSaleParams,
) => Promise<[FlashSale, string]>

export type UpdateFlashSaleFuncType = (
  shopId: number,
  flashSaleId: number,
  params: InsertFlashSaleParams,
) => Promise<[FlashSale, string]>

export type DeleteFlashSaleFuncType = (
  shopId: number,
  flashSaleId: number,
) => Promise<[FlashSale, string]>

export type InquiryFlashSaleByIdFuncType = (
  shopId: number,
  flashSaleId: number,
) => Promise<[FlashSale, string]>