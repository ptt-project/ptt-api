import { Condition } from "src/db/entities/Condition";

export type InquiryConditionByShopIdType = (
    shopId: number,
  ) => Promise<[Condition, string]>