import { AppEntity } from './AppEntity'
import { Column, Entity, ManyToOne, JoinColumn, OneToOne } from 'typeorm'
import { Wallet } from './Wallet'
import { WalletTransactionReference } from './WalletTransactionReference'
import { BankAccount } from './BankAccount'

export type TransactionType = 'deposit' | 'withdraw' | 'buy' | 'sell'
export type TransactionStatus = 'success' | 'fail' | 'cancel' | 'pending'

@Entity({ name: 'wallet_transactions' })
export class WalletTransaction extends AppEntity {
  @Column({ name: 'wallet_id', nullable: false })
  walletId: string

  @Column({
    name: 'type',
    type: 'enum',
    enum: ['deposit', 'withdraw', 'buy', 'sell'],
    nullable: false,
  })
  type: TransactionType

  @Column({
    name: 'amount',
    nullable: false,
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  amount: number

  @Column({ name: 'detail', nullable: true })
  detail: string

  @Column({
    name: 'status',
    type: 'enum',
    enum: ['success', 'fail', 'cancel', 'pending'],
    nullable: false,
  })
  status: TransactionStatus

  @Column({ name: 'reference_id', nullable: true })
  referenceId: string

  @Column({ name: 'bank_account_id', nullable: true })
  bankAccountId: string

  @ManyToOne(
    () => Wallet,
    wallet => wallet.transactions,
  )
  @JoinColumn({ name: 'wallet_id', referencedColumnName: 'id' })
  wallet: Wallet

  @OneToOne(
    () => WalletTransactionReference,
    reference => reference.transaction,
  )
  @JoinColumn({ name: 'reference_id', referencedColumnName: 'id' })
  reference: WalletTransactionReference

  @ManyToOne(
    () => BankAccount,
    bankAccount => bankAccount.transactions,
  )
  @JoinColumn({ name: 'bank_account_id', referencedColumnName: 'id' })
  bankAccount: BankAccount
}
