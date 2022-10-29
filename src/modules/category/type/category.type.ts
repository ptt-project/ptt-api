import { Category, CreatedByType, StatusType } from 'src/db/entities/Category'
import { ProductProfile } from 'src/db/entities/ProductProfile'
import { SelectQueryBuilder } from 'typeorm'

export type InsertCategoryToDbParams = {
  name: string
  shopId: string
  createdBy: CreatedByType
  priority: number
}

export type UpdateStatusCategoryToDbParams = {
  status: StatusType
}

export type InquiryCategoryToDbType = (
  shopId: string,
) => Promise<[Category[], string]>

export type InsertCategoryToDbType = (
  params: InsertCategoryToDbParams,
) => Promise<[Category, string]>

export type InquiryCategoryByIdType = (
  categoryId: string,
) => Promise<[Category, string]>

export type UpdateStatusCategoryToDbType = (
  categoryId: string,
  params: UpdateStatusCategoryToDbParams,
) => Promise<string>

export type UpdatePriorityCategoryToDbType = (
  categoryId: string,
  priority: number,
) => Promise<string>

export type DeleteCategoryToDbType = (category: Category) => Promise<string>

export type DeleteCategoryProductToDbByCategoryIdType = (
  categoryId: string,
) => Promise<string>

export type UpdateCategoryParams = {
  name: string
  productCount: number
}

export type UpdateCategoryToDbType = (
  categoryId: string,
  params: UpdateCategoryParams,
) => Promise<string>

export type InsertCategoryProductToDbType = (
  categoryId: string,
  productIds: string[],
) => Promise<string>

export type DeleteCategoryProductToDbType = (
  categoryId: string,
  productIds: string[],
) => Promise<string>

export type inquiryProductProfileIdsByCategoryIdType = (
  categoryId: string,
) => Promise<[string[], string]>

export type InquiryProductByCatgoryIdType = (
  categoryId: string,
) => Promise<[SelectQueryBuilder<ProductProfile>, string]>

export type InquiryCategoryByNameType = (
  name: string,
) => Promise<[Category, string]>
