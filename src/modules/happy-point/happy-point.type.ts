import { HappyPointLookup } from 'src/db/entities/HappyPointLookup'
import {
  HappyPointTransaction,
  HappyPointTransactionNote,
  HappyPointTransactionStatusType,
  HappyPointTransactionType,
} from 'src/db/entities/HappyPointTransaction'
import { Member } from 'src/db/entities/Member'

export type InsertHappyPointTypeBuyToDbType = (
  params: InsertHappyPointToDbParams,
) => Promise<[HappyPointTransaction, string]>

export type InsertHappyPointToDbParams = {
  refId: string
  amount: number
  point: number
  exchangeRate: number
  fromMemberId: number
  toMemberId?: number
  totalAmount: number
  fee?: number
  type: HappyPointTransactionType
  note: HappyPointTransactionNote
  status: HappyPointTransactionStatusType
}

export type UpdateCreditBalanceMemberToDbType = (
  params: UpdateCreditBalanceMemberToDbParams,
) => Promise<[Member, string]>

export type UpdateCreditBalanceMemberToDbParams = {
  member: Member
  point: number
}

export type InsertLookupToDbParams = {
  memberId: number
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
