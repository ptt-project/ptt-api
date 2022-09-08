import { HappyPoint } from 'src/db/entities/HappyPoint'
import { HappyPointLookup } from 'src/db/entities/HappyPointLookup'
import {
  HappyPointTransaction,
  HappyPointTransactionNote,
  HappyPointTransactionStatusType,
  HappyPointTransactionType,
} from 'src/db/entities/HappyPointTransaction'
import { SelectQueryBuilder } from 'typeorm'

export type InsertHappyPointTypeBuyToDbType = (
  params: InsertHappyPointToDbParams,
) => Promise<[HappyPointTransaction, string]>

export type InsertHappyPointToDbParams = {
  refId: string
  exchangeRate: number
  fromHappyPointId: number
  toHappyPointId?: number
  amount?: number
  fee?: number
  totalAmount?: number
  point: number
  feePoint?: number
  totalPoint?: number
  type: HappyPointTransactionType
  note: HappyPointTransactionNote
  status: HappyPointTransactionStatusType
}

export type UpdateBalanceToDbParams = {
  happyPoint: HappyPoint
  point: number
}

export type UpdateCreditBalanceToDbType = (
  params: UpdateBalanceToDbParams,
) => Promise<[HappyPoint, string]>

export type UpdateDebitBalanceToDbType = (
  params: UpdateBalanceToDbParams,
) => Promise<[HappyPoint, string]>

export type InsertLookupToDbParams = {
  happyPointId: number
  exchangeRate: number
}

export type InsertLookupToDbType = (
  params: InsertLookupToDbParams,
) => Promise<[HappyPointLookup, string]>

export type LookupExchangeRageType = (
  refId: string,
) => Promise<[number, string]>

export type ValidatePointType = (
  amount: number,
  exchangeRate: number,
  point: number,
) => Promise<string>

export type InsertHappyPointToDbType = (
  memberId: number,
) => Promise<[HappyPoint, string]>

export type InquiryHappyPointFromUsernameType = (
  username: string,
) => Promise<[HappyPoint, string]>

export type InquiryHappyPointFrommemberIdType = (
  memberId: number,
) => Promise<[HappyPoint, string]>

export type  InquiryHappyPointTransactionsByMemberIdType = (
  memberId: number,
  type: string,
) => Promise<[SelectQueryBuilder<HappyPointTransaction>, string]>

