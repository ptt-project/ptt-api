import { HappyPoint } from 'src/db/entities/HappyPoint'
import {
  HappyPointTransaction,
  HappyPointTransactionNote,
  HappyPointTransactionStatusType,
  HappyPointTransactionType,
} from 'src/db/entities/HappyPointTransaction'
import { Lookup } from './lookup.type'

export type InsertHappyPointTypeBuyToDbType = (
  params: InsertHappyPointToDbParams,
) => Promise<[HappyPointTransaction, string]>

export type InsertHappyPointToDbParams = {
  refId: string
  exchangeRate: number
  fromHappyPointId: string
  toHappyPointId?: string
  orderId?: string
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

export type LookupExchangeRageType = (
  refId: string,
) => Promise<[Lookup, string]>

export type ValidateCalculatePointByExchangeAndAmountType = (
  amount: number,
  exchangeRate: number,
  point: number,
) => Promise<string>

export type InsertHappyPointToDbType = (
  memberId: string,
) => Promise<[HappyPoint, string]>

export type InquiryHappyPointFromUsernameType = (
  username: string,
) => Promise<[HappyPoint, string]>

export type ValidateCalculatePointByTotalPointAndFeeType = (
  totalPoint: number,
  fee: number,
  point: number,
) => Promise<string>

export type ValidateCalculateAmountType = (
  totoalAmount: number,
  fee: number,
  amount: number,
) => Promise<string>

export type ValidateCalculateFeeAmountType = (
  totalAmount: number,
  feeAmountRate: number,
  feeAmount: number,
) => Promise<string>

export type ValidateCalculateFeePointType = (
  totalPoint: number,
  feePointRate: number,
  feePoint: number,
) => Promise<string>

export type InquiryRefIdExistInTransactionType = (
  refId: string,
) => Promise<[number, string]>

export type ValidateLimitTransferType = (
  limiTransfer: number,
  point: number,
) => Promise<string>

export type UpdateResetLimitTransferType = (
  happyPointTransferPercentLimit: number,
) => Promise<string>

export type UpdateDebitLimitTransferToDbType = (
  happyPoint: HappyPoint,
  point: number,
) => Promise<string>

export type UpdateCreditLimitTransferToDbType = (
  happyPoint: HappyPoint,
  point: number,
) => Promise<string>

export type DebitHappyPointTransactionParams = {
  point: number
  totalAmount: number
  feeAmount: number
  amount: number
  refId: string
  transactionType: 'SELL' | 'PAYMENT'
  orderId?: string
}

export type DebitHappyPointType = (
  happyPoint: HappyPoint,
  body: DebitHappyPointTransactionParams,
) => Promise<[HappyPoint, number, string]>
