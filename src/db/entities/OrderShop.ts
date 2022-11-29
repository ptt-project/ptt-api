import {
  transformerDayjsToDate,
  transformerDecimalToNumber,
} from 'src/utils/entity-transform'
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

export type OrderShopStatusType = 'BOOKING' | 'SHIPPING' | 'COMPLETE' | 'CANCEL'
@Entity({ name: 'order_shops' })
export class OrderShop extends AppEntity {
  @Column({ name: 'order_id', nullable: false })
  orderId: string

  @Column({ name: 'code', nullable: false })
  code: string

  @Column({ name: 'shop_voucher_id', nullable: true })
  shopVoucherId?: string

  @Column({ name: 'shop_id', nullable: false })
  shopId: string

  @Column({ name: 'shipping_option_id', nullable: true })
  shippingOptionId: string

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
    enum: ['BOOKING', 'SHIPPING', 'COMPLETE', 'CANCEL'],
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
