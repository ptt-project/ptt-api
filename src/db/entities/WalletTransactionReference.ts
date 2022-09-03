import { AppEntity } from './AppEntity'
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm'
import { WalletTransaction } from './WalletTransaction'

@Entity({ name: 'wallet_transaction_references' })
export class WalletTransactionReference extends AppEntity {
  @Column({ name: 'transaction_id', nullable: false })
  transactionId: number

  @Column({ name: 'result_code', nullable: true})
  resultCode: string

  @Column({ name: 'reference_no', nullable: false})
  referenceNo: string

  @Column({ name: 'gbp_reference_no', nullable: true})
  gbpReferenceNo: string

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

  @OneToOne(
    () => WalletTransaction,
    walletTransaction => walletTransaction.reference,
  )
  @JoinColumn({ name: 'transaction_id', referencedColumnName: 'id' })
  transaction: WalletTransaction
}
