import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { AppEntity } from './AppEntity'
import { PlatformCategory } from './PlatformCategory'
import { ProductProfile } from './ProductProfile'
import { Shop } from './Shop'

@Entity({ name: 'products' })
export class Product extends AppEntity {
  @Column({ name: 'sku' })
  sku: string

  @Column({ name: 'product_profile_id' })
  productProfileId: string

  @Column({ name: 'option1', nullable: true })
  option1: string

  @Column({ name: 'option2', nullable: true })
  option2: string

  @Column({
    name: 'price',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  price: number

  @Column({ name: 'stock', nullable: true })
  stock: number

  @Column({
    name: 'sold',
    type: 'decimal',
    default: 0,
    precision: 12,
    scale: 4,
    nullable: false,
  })
  sold: number

  @Column({ name: 'amount_sold', nullable: false, default: 0 })
  amountSold: number

  @ManyToOne(
    () => ProductProfile,
    productProfile => productProfile.products,
    { createForeignKeyConstraints: false },
  )
  @JoinColumn({ name: 'product_profile_id' })
  productProfile: ProductProfile

  @ManyToOne(
    () => Shop,
    shop => shop.products,
  )
  @JoinColumn({ name: 'shop_id', referencedColumnName: 'id' })
  shop: Shop

  @ManyToOne(
    () => PlatformCategory,
    platformCategory => platformCategory.products,
  )
  @JoinColumn({ name: 'platform_category_id', referencedColumnName: 'id' })
  platformCategory: PlatformCategory
}
