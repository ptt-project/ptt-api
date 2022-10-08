import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm'
import { AppEntity } from './AppEntity'
import { FlashSale } from './FlashSale'
import { ProductProfile } from './ProductProfile'

export type DiscountType = 'value' | 'percentage'
@Entity({ name: 'flash_sale_product_profiles' })
export class FlashSaleProductProfile extends AppEntity {
  @Column({ name: 'flash_sale_id', nullable: false })
  flashSaleId: number

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
    precision: 14,
    scale: 4,
    nullable: false,
  })
  discount: number

  @Column({ name: 'limit_to_stock', nullable: true })
  limitToStock: number

  @Column({ name: 'limit_to_buy', nullable: true })
  limitToBuy: number

  @Column({ name: 'isActive', nullable: false, default: true })
  isActive: boolean

  @ManyToOne(
    () => FlashSale,
    flashSale => flashSale.productProfiles,
  )
  @JoinColumn({ name: 'flash_sale_id', referencedColumnName: 'id' })
  flashSale: FlashSale

  @ManyToOne(
    () => ProductProfile,
    productProfile => productProfile.flashSaleProductProfiles,
  )
  @JoinColumn({ name: 'product_profile_id', referencedColumnName: 'id' })
  productProfile: ProductProfile
}
