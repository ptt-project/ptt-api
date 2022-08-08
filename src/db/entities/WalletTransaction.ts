import { AppEntity } from './AppEntity'
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm'
import { Wallet } from './Wallet'

export type TransactionType = 'deposit' | 'withdraw' | 'buy' | 'sell'
export type TransactionStatus = 'success' | 'fail' | 'cancel' | 'pending'

@Entity({ name: 'wallet_transactions' })
export class WalletTransaction extends AppEntity {
  @Column({ name: 'wallet_id', nullable: false })
  walletId: number

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

  @ManyToOne(
    () => Wallet,
    wallet => wallet.transactions,
  )
  @JoinColumn({ name: 'wallet_id', referencedColumnName: 'id' })
  wallet: Wallet
}