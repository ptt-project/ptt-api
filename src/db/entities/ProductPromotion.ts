import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm'
import { AppEntity } from './AppEntity'
import { Product } from './Product'
import { Promotion } from './Promotion'

export type DiscountType = 'value' | 'percentage'
@Entity({ name: 'product_promotions' })
export class ProductPromotion extends AppEntity {
  @Column({ name: 'promotion_id', nullable: false })
  promotionId: number

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
    precision: 9,
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
  })
  price: number

  @Column({ name: 'isActive', nullable: false, default: true })
  isActive: boolean

  @ManyToOne(
    () => Promotion,
    promotion => promotion.products,
  )
  @JoinColumn({ name: 'promotion_id', referencedColumnName: 'id' })
  promotion: Promotion

  @ManyToOne(
    () => Product,
    product => product.productPromotions,
  )
  @JoinColumn({ name: 'product_id', referencedColumnName: 'id' })
  product: Product
}
