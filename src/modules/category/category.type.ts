import { Category, CreatedByType } from 'src/db/entities/Category'

export type InsertCategoryToDbParams = {
  name: string,
  shopId: number,
  createdBy: CreatedByType,
  priority: number,
}

export type InqueryGetCategoryToDbType = (
  shopId: number,
) => Promise<[Category[], string]>

export type InqueryInsertCategoryToDbType = (
  params: InsertCategoryToDbParams,
) => Promise<[Category, string]>

