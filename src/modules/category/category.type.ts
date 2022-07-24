import { Category, CreatedByType, StatusType } from 'src/db/entities/Category'

export type InsertCategoryToDbParams = {
  name: string,
  shopId: number,
  createdBy: CreatedByType,
  priority: number,
}

export type UpdateStatusCategoryToDbParams = {
  status: StatusType,
}

export type InqueryGetCategoryToDbType = (
  shopId: number,
) => Promise<[Category[], string]>

export type InqueryInsertCategoryToDbType = (
  params: InsertCategoryToDbParams,
) => Promise<[Category, string]>

export type InqueryGetCategoryByCategoryIdToDbType = (
  categoryId : number,
) => Promise<[Category, string]>

export type UpdateStatusCategoryToDbType = (
  categoryId : number,
  params: UpdateStatusCategoryToDbParams,
) => Promise<string>

export type UpdatePriorityCategoryToDbType = (
  categoryId : number,
  priority: number,
) => Promise<string>