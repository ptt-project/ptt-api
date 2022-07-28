import { Category, CreatedByType, StatusType } from 'src/db/entities/Category'
import { ProductProfile } from 'src/db/entities/ProductProfile'
import { SelectQueryBuilder } from 'typeorm'

export type InsertCategoryToDbParams = {
  name: string
  shopId: number
  createdBy: CreatedByType
  priority: number
}

export type UpdateStatusCategoryToDbParams = {
  status: StatusType
}

export type InquiryCategoryToDbType = (
  shopId: number,
) => Promise<[Category[], string]>

export type InsertCategoryToDbType = (
  params: InsertCategoryToDbParams,
) => Promise<[Category, string]>

export type InquiryCategoryByIdType = (
  categoryId: number,
) => Promise<[Category, string]>

export type UpdateStatusCategoryToDbType = (
  categoryId: number,
  params: UpdateStatusCategoryToDbParams,
) => Promise<string>

export type UpdatePriorityCategoryToDbType = (
  categoryId: number,
  priority: number,
) => Promise<string>

export type DeleteCategoryToDbType = (category: Category) => Promise<string>

export type DeleteCategoryProductToDbByCategoryIdType = (
  categoryId: number,
) => Promise<string>

export type UpdateCategoryParams = {
  name: string
  productCount: number
}

export type UpdateCategoryToDbType = (
  categoryId: number,
  params: UpdateCategoryParams,
) => Promise<string>

export type InsertCategoryProductToDbType = (
  categoryId: number,
  productIds: number[],
) => Promise<string>

export type DeleteCategoryProductToDbType = (
  categoryId: number,
  productIds: number[],
) => Promise<string>

export type inquiryProductProfileIdsByCategoryIdType = (
  categoryId: number,
) => Promise<[number[], string]>

export type InquiryProductByCatgoryIdType = (
  categoryId: number,
) => Promise<[SelectQueryBuilder<ProductProfile>, string]>

export type InquiryCategoryByNameType = (
  name: string,
) => Promise<[Category, string]>
