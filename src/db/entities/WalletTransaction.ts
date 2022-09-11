import { AppEntity } from './AppEntity'
import { Column, Entity, ManyToOne, JoinColumn, OneToOne } from 'typeorm'
import { Wallet } from './Wallet'
import { WalletTransactionReference } from './WalletTransactionReference'
import { BankAccount } from './BankAccount'
import { transformerDecimalToNumber } from 'src/utils/entity-transform'

export type TransactionType = 'deposit' | 'withdraw' | 'buy' | 'sell' | 'buy_happy_point' | 'sell_happy_point'
export type TransactionStatus = 'success' | 'fail' | 'cancel' | 'pending'
export type TransactionNote = 'credit' | 'debit'

@Entity({ name: 'wallet_transactions' })
export class WalletTransaction extends AppEntity {
  @Column({ name: 'wallet_id', nullable: false })
  walletId: number

  @Column({
    name: 'type', 
    type: 'enum',
    enum: ['deposit', 'withdraw', 'buy', 'sell', 'buy_happy_point', 'sell_happy_point'],
    nullable: false,
  })
  type: TransactionType

  @Column({
    name: 'amount',
    nullable: false,
    type: 'decimal',
    precision: 14,
    scale: 4,
    default: 0,
    transformer: transformerDecimalToNumber,
  })
  amount: number

  @Column({
    name: 'fee',
    nullable: false,
    type: 'decimal',
    precision: 14,
    scale: 4,
    default: 0,
    transformer: transformerDecimalToNumber,
  })
  fee: number

  @Column({
    name: 'fee_rate',
    nullable: false,
    type: 'decimal',
    precision: 14,
    scale: 4,
    default: 0,
    transformer: transformerDecimalToNumber,
  })
  feeRate: number

  @Column({
    name: 'total',
    nullable: false,
    type: 'decimal',
    precision: 14,
    scale: 4,
    default: 0,
    transformer: transformerDecimalToNumber,
  })
  total: number

  @Column({ name: 'detail', nullable: true })
  detail: string

  @Column({
    name: 'status', 
    type: 'enum',
    enum: ['success', 'fail', 'cancel', 'pending'],
    nullable: false,
  })
  status: TransactionStatus

  @Column({
    name: 'note', 
    type: 'enum',
    enum: ['credit', 'debit'],
    nullable: false,
  })
  note: TransactionNote

  @Column({ name: 'reference_id', nullable: true })
  referenceId: number

  @Column({ name: 'bank_account_id', nullable: true })
  bankAccountId: number

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
