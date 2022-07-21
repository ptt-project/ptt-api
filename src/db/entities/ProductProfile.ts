import { Column, Entity, JoinColumn, OneToMany, ManyToOne } from 'typeorm'
import { AppEntity } from './AppEntity'
import { PlatformCategory } from './PlatformCategory'
import { Product } from './Product'
import { ProductOption } from './ProductOption'
import { Shop } from './Shop'

export type ConditionType = 'old' | 'new'
export type ProductProfileStatusType = 'public' | 'hidden' | 'out of stock'
@Entity({ name: 'product_profiles' })
export class ProductProfile extends AppEntity {
  @Column({ name: 'name', nullable: false })
  name: string

  @Column({ name: 'detail', type: 'text', nullable: false })
  detail: string

  @Column({ name: 'shop_id', nullable: false })
  shopId: number

  @Column({ name: 'platform_category_id', nullable: false })
  platformCategoryId: number

  @Column({ name: 'brand_id', nullable: false })
  brandId: number

  @Column({ name: 'status', nullable: false })
  status: ProductProfileStatusType

  @Column({ name: 'approval', nullable: false, default: false })
  approval: boolean

  @Column({ name: 'weight', type: 'decimal', precision: 5, scale: 2 })
  weight: number

  @Column({ name: 'exp' })
  exp: number

  @Column({ name: 'condition' })
  condition: ConditionType

  @Column({ name: 'is_send_lated' })
  isSendLated: boolean

  @Column({ name: 'extra_day' })
  extraDay: number

  @Column({ name: 'video_link' })
  videoLink: string

  @Column({ name: 'image_ids', type: 'simple-json' })
  imageIds: string[]

  @Column({ name: 'watched', default: 0 })
  watched: number

  @Column({ name: 'like', default: 0 })
  like: number

  @OneToMany(
    () => Product,
    product => product.productProfile,
  )
  @JoinColumn({ referencedColumnName: 'product_profile_id' })
  products: Product[]

  @OneToMany(
    () => ProductOption,
    productOption => productOption.productProfile,
  )
  @JoinColumn({ referencedColumnName: 'product_profile_id' })
  productOptions: ProductOption[]

  @ManyToOne(
    () => Shop,
    shop => shop.productProfiles,
  )
  @JoinColumn({ name: 'shop_id', referencedColumnName: 'id' })
  shop: Shop

  @ManyToOne(
    () => PlatformCategory,
    platformCategory => platformCategory.productProfiles,
  )
  @JoinColumn({ name: 'platform_category_id', referencedColumnName: 'id' })
  platformCategory: PlatformCategory
}
