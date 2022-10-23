import { Wallet } from 'src/db/entities/Wallet'
import {
  TransactionType,
  WalletTransaction,
} from 'src/db/entities/WalletTransaction'
import { SelectQueryBuilder } from 'typeorm'

export type InqueryWalletTransactionFuncType = (
  walletId: string,
  startDate: Date,
  endDate: Date,
  type: TransactionType,
) => Promise<[SelectQueryBuilder<WalletTransaction>, string]>

export type InsertWalletToDbFuncType = (
  memberId: string,
) => Promise<[Wallet, string]>

export type InsertTransactionToDbFuncType = (
  walletId: string,
  amount: number,
  detail: string,
  type: TransactionType,
  bankAccountId?: string,
) => Promise<[WalletTransaction, string]>

export type InsertReferenceToDbFuncType = (
  walletTransaction: WalletTransaction,
) => Promise<[string, string]>

export type InsertWithdrawReferenceToDbFuncType = (
  walletTransaction: WalletTransaction,
) => Promise<[string, string]>

export type RequestDepositQrCodeFuncType = (
  amount: number,
  referenceNo: string,
  detail: string,
) => Promise<[string, string]>

export type RequesWithdrawFuncType = (
  amount: number,
  referenceNo: string,
  detail: string,
) => Promise<[string, string]>

export type RequestWithdrawFuncType = (
  amount: number,
  referenceNo: string,
  detail: string,
) => Promise<[string, string]>

export type AdjustWalletFuncType = (
  walletId: string,
  adjustBalance: number,
) => Promise<[Wallet, string]>
