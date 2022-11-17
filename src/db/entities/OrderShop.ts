import { transformerDayjsToDate } from 'src/utils/entity-transform'
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm'
import { AppEntity } from './AppEntity'
import { Order } from './Order'
import { OrderShopProduct } from './OrderShopProduct'
import { ShippingOption } from './ShippingOption'
import { Shop } from './Shop'
import { WalletTransaction } from './WalletTransaction'

export type OrderShopStatusType =
  | 'toPay'
  | 'toShip'
  | 'toReceive'
  | 'complated'
  | 'cancelled'
  | 'return'
  | 'refund'
@Entity({ name: 'order_shops' })
export class OrderShop extends AppEntity {
  @Column({ name: 'order_id', nullable: false })
  orderId: string

  @Column({ name: 'order_number', nullable: false })
  orderNumber: string

  @Column({ name: 'shop_voucher_id', nullable: true })
  shopVoucherId?: string

  @Column({ name: 'shop_id', nullable: false })
  shopId: string

  @Column({
    name: 'order_shop_amount',
    nullable: false,
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  orderShopAmount: number

  @Column({ name: 'shipping_option_id', nullable: false })
  shippingOptionId: string

  @Column({
    name: 'shipping_price',
    nullable: false,
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  shippingPrice: number

  @Column({
    name: 'min_deliver_date',
    nullable: false,
    transformer: transformerDayjsToDate,
  })
  minDeliverDate: Date

  @Column({
    name: 'max_deliver_date',
    nullable: false,
    transformer: transformerDayjsToDate,
  })
  maxDeliverDate: Date

  @Column({ name: 'note', nullable: true })
  note?: string

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
  status: OrderShopStatusType

  @Column({
    name: 'send_date',
    nullable: true,
    transformer: transformerDayjsToDate,
  })
  sendDate?: Date

  @Column({
    name: 'expected_date',
    nullable: true,
    transformer: transformerDayjsToDate,
  })
  expectedDate?: Date

  @Column({ name: 'wallet_transaction_id', nullable: true })
  walletTransactionId: string

  @ManyToOne(
    () => Order,
    order => order.orderShop,
  )
  @JoinColumn({ name: 'order_id', referencedColumnName: 'id' })
  order: Order

  @ManyToOne(
    () => Shop,
    shop => shop.orderShop,
  )
  @JoinColumn({ name: 'shop_id', referencedColumnName: 'id' })
  shop: Shop

  @ManyToOne(
    () => ShippingOption,
    shippingOption => shippingOption.orderShop,
  )
  @JoinColumn({ name: 'shipping_option_id', referencedColumnName: 'id' })
  shippingOption: ShippingOption

  @OneToMany(
    () => OrderShopProduct,
    orderShopProduct => orderShopProduct.orderShop,
  )
  @JoinColumn({ referencedColumnName: 'order_shop_id' })
  orderShopProduct: OrderShopProduct[]

  @OneToOne(
    () => WalletTransaction,
    walletTransaction => walletTransaction.orderShop,
  )
  @JoinColumn({ name: 'wallet_transaction_id', referencedColumnName: 'id' })
  walletTransaction: WalletTransaction
}
