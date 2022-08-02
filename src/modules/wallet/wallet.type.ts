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


