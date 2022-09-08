import { Wallet } from 'src/db/entities/Wallet'
import { TransactionType, WalletTransaction } from 'src/db/entities/WalletTransaction'
import { WalletTransactionReference } from 'src/db/entities/WalletTransactionReference'
import { SelectQueryBuilder } from 'typeorm'

export type RequestInteranlWalletTransactionServiceFuncType = (
  walletId: number,
  amount: number,
  detail: string,
  type: TransactionType,
  thirdPtReferenceNo: string,
) => Promise<[Wallet, string]>

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
  bankAccountId?: number,
) => Promise<[WalletTransaction, string]>

export type InsertReferenceToDbFuncType = (
  walletTransaction: WalletTransaction,
) => Promise<[string, string]>

export type UpdateReferenceToDbFuncType = (
  referenceNo: string,
  thirdPtReferenceNo: string,
  amount: number,
  detail: string,
) => Promise<[WalletTransactionReference, string]>

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
  walletId: number,
  adjustBalance: number,
  transactionType: TransactionType,
) => Promise<[Wallet, string]>
