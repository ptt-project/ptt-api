import { transformerDecimalToNumber } from 'src/utils/entity-transform'
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm'
import { AppEntity } from './AppEntity'
import { FlashSale } from './FlashSale'
import { Product } from './Product'
import { ProductProfile } from './ProductProfile'

export type DiscountType = 'value' | 'percentage'
@Entity({ name: 'flash_sale_products' })
export class FlashSaleProduct extends AppEntity {
  @Column({ name: 'flash_sale_id', nullable: false })
  flashSaleId: number

  @Column({ name: 'product_id', nullable: false })
  productId: number

  @Column({
    name: 'discount_type',
    nullable: false,
    type: 'enum',
    enum: ['value', 'percentage'],
    default: 'value',
  })
  discountType: DiscountType

  @Column({
    name: 'discount',
    type: 'decimal',
    precision: 14,
    scale: 4,
    nullable: false,
  })
  discount: number

  @Column({
    name: 'price',
    type: 'decimal',
    precision: 14,
    scale: 4,
    nullable: false,
    transformer: transformerDecimalToNumber,
  })
  price: number

  @Column({ name: 'limit_to_stock', nullable: true })
  limitToStock: number

  @Column({ name: 'limit_to_buy', nullable: true })
  limitToBuy: number

  @Column({ name: 'sold', nullable: false, default: 0 })
  sold: number

  @Column({ name: 'isActive', nullable: false, default: true })
  isActive: boolean

  @ManyToOne(
    () => FlashSale,
    flashSale => flashSale.products,
  )
  @JoinColumn({ name: 'flash_sale_id', referencedColumnName: 'id' })
  flashSale: FlashSale

  @ManyToOne(
    () => Product,
    product => product.flashSaleProducts,
  )
  @JoinColumn({ name: 'product_id', referencedColumnName: 'id' })
  product: Product
}
