import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm";
import { AppEntity } from "./AppEntity";
import { BankPayment } from "./BankPayment";
import { Order } from "./Order";
import { WalletTransaction } from "./WalletTransaction";

export type PaymentType = 'bank' | 'happyPoint' | 'ewallet' | 'cashOnDelivery'
export type PaymentStatusType = 'toPay' | 'toShip' | 'toReceive' | 'complated' | 'cancelled' | 'return' | 'refund'
@Entity({ name: 'payments' })
export class Payment extends AppEntity {
  @Column({ name: 'order_id', nullable: true })
  orderId: string

  @Column({
    name: 'payment_type', 
    type: 'enum',
    enum: ['bank', 'happyPoint', 'ewallet', 'cashOnDelivery'],
    nullable: false,
  })
  paymentType: PaymentType

  @Column({ name: 'bank_payment_id', nullable: true })
  bankPaymentId?: string

  @Column({ name: 'qr_code', nullable: true })
  qrCode?: string

  @Column({ name: 'reference', nullable: true })
  reference?: string

  @Column({ name: 'happy_point_transaction_id', nullable: true })
  happyPointTransactionId?: string

  @Column({ name: 'wallet_transaction_id', nullable: true })
  walletTransactionId?: string

  @Column({
    name: 'status', 
    type: 'enum',
    enum: ['toPay', 'toShip', 'toReceive', 'complated', 'cancelled', 'return', 'refund'],
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