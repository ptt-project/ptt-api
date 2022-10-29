import { Condition } from "src/db/entities/Condition";

export type InquiryConditionByShopIdType = (
    shopId: string,
  ) => Promise<[Condition, string]>