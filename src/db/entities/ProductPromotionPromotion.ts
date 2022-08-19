import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm'
import { AppEntity } from './AppEntity'
import { Promotion } from './Promotion'

export type DiscountType = 'value' | 'percentage'
@Entity({ name: 'product_profile_promotions' })
export class ProductProfilePromotion extends AppEntity {
  @Column({ name: 'promotion_id', nullable: false })
  promotionId: number

  @Column({ name: 'product_profile_id', nullable: false })
  productProfileId: number

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
    precision: 5,
    scale: 4,
    nullable: false,
  })
  discount: number

  @Column({ name: 'limit_to_stock', nullable: false })
  limitToStock: number

  @Column({ name: 'limit_to_buy', nullable: false })
  limitToBuy: number

  @Column({ name: 'isActive', nullable: false, default: true })
  isActive: boolean

  @ManyToOne(
    () => Promotion,
    promotion => promotion.productProfiles,
  )
  @JoinColumn({ name: 'promotion_id', referencedColumnName: 'id' })
  promotion: Promotion
}
