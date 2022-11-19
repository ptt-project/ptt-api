import { transformerDecimalToNumber } from 'src/utils/entity-transform'
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
    name: 'totalPrice',
    nullable: false,
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: transformerDecimalToNumber,
  })
  totalPrice: number

  @Column({
    name: 'total_price_of_products',
    nullable: false,
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: transformerDecimalToNumber,
  })
  totalPriceOfProducts: number

  @Column({
    name: 'total_price_of_shippings',
    nullable: false,
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: transformerDecimalToNumber,
  })
  totalPriceOfShippings: number

  @Column({
    name: 'discount',
    nullable: false,
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: transformerDecimalToNumber,
  })
  discount: number

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
