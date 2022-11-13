import { Condition } from "src/db/entities/Condition";
import { Shop } from "src/db/entities/Shop";

export type InsertConditionToDbFuncType = (
  shop: Shop,
) => Promise<[Condition, string]>

export type InquiryConditionByShopIdType = (
  shopId: string,
) => Promise<[Condition, string]>