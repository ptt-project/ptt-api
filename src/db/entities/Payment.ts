import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm'
import { AppEntity } from './AppEntity'
import { BankPayment } from './BankPayment'
import { Order } from './Order'
import { WalletTransaction } from './WalletTransaction'

export type PaymentType = 'BANK' | 'HAPPYPOINT' | 'EWALLET' | 'CASHONDELIVERY'
export type PaymentStatusType =
  | 'WAITING_PAYMENT'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'RETURN'
  | 'REFUND'
@Entity({ name: 'payments' })
export class Payment extends AppEntity {
  @Column({ name: 'order_id', nullable: true })
  orderId: string

  @Column({ name: 'reference', nullable: true })
  reference?: string

  @Column({ name: 'qr_code', nullable: true })
  qrCode?: string

  @Column({
    name: 'paymentable_id',
    type: 'uuid',
    nullable: false,
  })
  paymentableId: string

  @Column({
    name: 'paymentable_type',
    type: 'enum',
    enum: ['BANK', 'HAPPYPOINT', 'EWALLET', 'CASHONDELIVERY'],
    nullable: false,
  })
  paymentableType: PaymentType

  @Column({ name: 'bank_payment_id', nullable: true })
  bankPaymentId?: string

  @Column({
    name: 'status',
    type: 'enum',
    enum: ['WAITING_PAYMENT', 'COMPLETED', 'CANCELLED', 'RETURN', 'REFUND'],
    nullable: false,
  })
  status: PaymentStatusType

  @OneToOne(
    () => Order,
    order => order.payment,
  )
  @JoinColumn({ name: 'order_id', referencedColumnName: 'id' })
  order: Order

  @ManyToOne(
    () => BankPayment,
    bankPayment => bankPayment.payment,
  )
  @JoinColumn({ name: 'bank_payment_id', referencedColumnName: 'id' })
  bankPayment: BankPayment

  @ManyToOne(
    () => WalletTransaction,
    walletTransaction => walletTransaction.payment,
  )
  @JoinColumn({ name: 'wallet_transaction_id', referencedColumnName: 'id' })
  walletTransaction: WalletTransaction
}
