import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { AppEntity } from "./AppEntity";
import { OrderShop } from "./OrderShop";
import { Product } from "./Product";

export type OrderShopProductStatusType = 'toPay' | 'toShip' | 'toReceive' | 'complated' | 'cancelled' | 'return' | 'refund'
@Entity({ name: 'order_shop_products' })
export class OrderShopProduct extends AppEntity {
  @Column({ name: 'order_shop_id', nullable: false })
  orderShopId: string

  @Column({
    name: 'unit_price',
    nullable: false,
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  unitPrice: number

  @Column({ name: 'units', nullable: false })
  units: number

  @Column({ name: 'product_profile_image', nullable: true })
  productProfileImage?: string

  @Column({ name: 'product_profile_name', nullable: false })
  productProfileName: string

  @Column({ name: 'product_id', nullable: false })
  productId: string

  @Column({ name: 'product_options_1', nullable: true })
  productOptions1?: string

  @Column({ name: 'product_options_2', nullable: true })
  productOptions2?: string

  @Column({
    name: 'status', 
    type: 'enum',
    enum: ['toPay', 'toShip', 'toReceive', 'complated', 'cancelled', 'return', 'refund'],
    nullable: false,
  })
  status: OrderShopProductStatusType

  @Column({ name: 'product_profile_json', type: 'simple-json', nullable: false })
  productProfileJson: string

  @ManyToOne(
    () => OrderShop,
    orderShop => orderShop.orderShopProduct,
  )
  @JoinColumn({ name: 'order_shop_id', referencedColumnName: 'id' })
  orderShop: OrderShop

  @ManyToOne(
    () => Product,
    product => product.orderShopProduct,
  )
  @JoinColumn({ name: 'product_id', referencedColumnName: 'id' })
  product: Product
}