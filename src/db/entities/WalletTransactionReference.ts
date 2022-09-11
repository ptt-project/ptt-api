import { AppEntity } from './AppEntity'
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm'
import { WalletTransaction } from './WalletTransaction'
import { transformerDecimalToNumber } from 'src/utils/entity-transform'

@Entity({ name: 'wallet_transaction_references' })
export class WalletTransactionReference extends AppEntity {
  @Column({ name: 'transaction_id', nullable: false })
  transactionId: number

  @Column({ name: 'result_code', nullable: true})
  resultCode: string

  @Column({ name: 'reference_no', nullable: false})
  referenceNo: string

  @Column({ name: 'third_pt_reference_no', nullable: true})
  thirdPtReferenceNo: string

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

  @Column({ name: 'detail', nullable: true })
  detail: string

  @OneToOne(
    () => WalletTransaction,
    walletTransaction => walletTransaction.reference,
  )
  @JoinColumn({ name: 'transaction_id', referencedColumnName: 'id' })
  transaction: WalletTransaction
}
