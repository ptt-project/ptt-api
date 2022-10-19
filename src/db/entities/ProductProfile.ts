import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  PrimaryColumn,
  Generated,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { CategoryProductProfile } from './CategoryProductProfile'
import { FlashSaleProduct } from './FlashSaleProduct'
import { PlatformCategory } from './PlatformCategory'
import { Product } from './Product'
import { ProductOption } from './ProductOption'
import { Shop } from './Shop'
import { transformerDayjsToDate, transformerDecimalToNumber } from 'src/utils/entity-transform'

export type ConditionType = 'old' | 'new'
export type ProductProfileStatusType = 'public' | 'hidden' | 'out of stock'
@Entity({ name: 'product_profiles' })
export class ProductProfile {
  @PrimaryColumn({ primary: false })
  @Generated('increment')
  id: number

  @Column({ name: 'name' })
  name: string

  @Column({ name: 'detail', type: 'text' })
  detail: string

  @Column({ name: 'shop_id' })
  shopId: number

  @Column({ name: 'platform_category_id' })
  platformCategoryId: number

  @Column({ name: 'brand_id', nullable: true })
  brandId: number

  @Column({ name: 'status' })
  status: ProductProfileStatusType

  @Column({ name: 'approval', default: false })
  approval: boolean

  @Column({ name: 'weight', type: 'decimal', precision: 5, scale: 2 })
  weight: number

  @Column({ name: 'width', nullable: false })
  width: number

  @Column({ name: 'length', nullable: false })
  length: number

  @Column({ name: 'height', nullable: false })
  height: number

  @Column({ name: 'exp', nullable: true })
  exp: number

  @Column({ name: 'condition', nullable: true })
  condition: ConditionType

  @Column({ name: 'is_send_lated', nullable: true })
  isSendLated: boolean

  @Column({ name: 'extra_day', nullable: true })
  extraDay: number

  @Column({ name: 'video_link', nullable: true })
  videoLink: string

  @Column({ name: 'image_ids', type: 'simple-json', nullable: true })
  imageIds: string[]

  @Column({ name: 'watched', default: 0, nullable: true })
  watched: number

  @Column({ name: 'like', default: 0, nullable: true })
  like: number

  @Column({
    name: 'min_price',
    type: 'decimal',
    precision: 14,
    scale: 4,
    nullable: false,
    transformer: transformerDecimalToNumber,
  })
  minPrice: number

  @Column({
    name: 'max_price',
    type: 'decimal',
    precision: 14,
    scale: 4,
    nullable: false,
    transformer: transformerDecimalToNumber,
  })
  maxPrice: number

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

  @OneToMany(
    () => CategoryProductProfile,
    categoryProductProfile => categoryProductProfile.productProfile,
  )
  @JoinColumn({ referencedColumnName: 'product_profile_id' })
  categoryProductProfiles: CategoryProductProfile[]

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    nullable: false,
    transformer: transformerDayjsToDate,
  })
  createdAt: Date

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    nullable: false,
    transformer: transformerDayjsToDate,
  })
  updatedAt: Date

  @DeleteDateColumn({ name: 'deleted_at', transformer: transformerDayjsToDate })
  deletedAt: Date
}
