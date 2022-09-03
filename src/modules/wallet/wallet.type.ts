import { Wallet } from 'src/db/entities/Wallet'
import { TransactionType, WalletTransaction } from 'src/db/entities/WalletTransaction'
import { SelectQueryBuilder } from 'typeorm'

export type InqueryWalletTransactionFuncType = (
  walletId: number,
  startDate: Date,
  endDate: Date,
  type: TransactionType,
) => Promise<[SelectQueryBuilder<WalletTransaction>, string]>

export type InsertWalletToDbFuncType = (
  memberId: number,
) => Promise<[Wallet, string]>

export type InsertTransactionToDbFuncType = (
  walletId: number,
  amount: number,
  detail: string,
  type: TransactionType,
) => Promise<[WalletTransaction, string]>

export type InsertDepositReferenceToDbFuncType = (
  walletTransaction: WalletTransaction,
) => Promise<[string, string]>

export type RequestDepositQrCodeFuncType = (
  amount: number,
  referenceNo: string,
  detail: string,
) => Promise<[string, string]>

export type AdjustWalletFuncType = (
  walletId: number,
  adjustBalance: number,
) => Promise<[Wallet, string]>
