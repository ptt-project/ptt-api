import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm'
import { AppEntity } from './AppEntity'
import { HappyPointTransaction } from './HappyPointTransaction'
import { Member } from './Member'
import { OrderShop } from './OrderShop'
import { Payment } from './Payment'

export type OrderStatusType =
  | 'toPay'
  | 'toShip'
  | 'toReceive'
  | 'complated'
  | 'cancelled'
  | 'return'
  | 'refund'
@Entity({ name: 'orders' })
export class Order extends AppEntity {
  @Column({ name: 'member_id', nullable: false })
  memberId: string

  @Column({ name: 'happy_voucher_id', nullable: true })
  happyVoucherId?: string

  @Column({ name: 'payment_id', nullable: true })
  paymentId?: string

  @Column({
    name: 'merchandise_subtotal',
    nullable: false,
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  merchandiseSubtotal: number

  @Column({
    name: 'shipping_total',
    nullable: false,
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  shippingTotal: number

  @Column({
    name: 'discount',
    nullable: false,
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  discount: number

  @Column({
    name: 'amount',
    nullable: false,
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  amount: number

  @Column({ name: 'name', nullable: false })
  name: string

  @Column({ name: 'address', nullable: false })
  address: string

  @Column({ name: 'province', nullable: false })
  province: string

  @Column({ name: 'tambon', nullable: false })
  tambon: string

  @Column({ name: 'district', nullable: false })
  district: string

  @Column({ name: 'postcode', nullable: false, length: 5 })
  postcode: string

  @Column({ name: 'mobile', nullable: false, length: 20 })
  mobile: string

  @Column({
    name: 'status',
    type: 'enum',
    enum: [
      'toPay',
      'toShip',
      'toReceive',
      'complated',
      'cancelled',
      'return',
      'refund',
    ],
    nullable: false,
  })
  status: OrderStatusType

  @ManyToOne(
    () => Member,
    member => member.order,
  )
  @JoinColumn({ name: 'member_id', referencedColumnName: 'id' })
  member: Member

  @OneToMany(
    () => OrderShop,
    orderShop => orderShop.order,
  )
  @JoinColumn({ referencedColumnName: 'order_id' })
  orderShop: OrderShop[]

  @OneToOne(
    () => Payment,
    payment => payment.order,
  )
  @JoinColumn({ name: 'payment_id', referencedColumnName: 'id' })
  payment: Payment

  @OneToMany(
    () => HappyPointTransaction,
    happyPointTransactins => happyPointTransactins.order,
  )
  @JoinColumn({ referencedColumnName: 'order_id' })
  happyPointTransactins: HappyPointTransaction[]
}
