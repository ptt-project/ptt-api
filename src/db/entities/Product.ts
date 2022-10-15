import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { AppEntity } from './AppEntity'
import { Category } from './Category'
import { FlashSaleProduct } from './FlashSaleProduct'
import { PlatformCategory } from './PlatformCategory'
import { ProductProfile } from './ProductProfile'
import { ProductPromotion } from './ProductPromotion'
import { Shop } from './Shop'

@Entity({ name: 'products' })
export class Product extends AppEntity {
  @Column({ name: 'sku' })
  sku: string

  @Column({ name: 'product_profile_id' })
  productProfileId: number

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

  @ManyToOne(
    () => ProductProfile,
    productProfile => productProfile.products,
  )
  @JoinColumn({ name: 'product_profile_id', referencedColumnName: 'id' })
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


  @OneToMany(
    () => FlashSaleProduct,
    flashSale => flashSale.product,
  )
  @JoinColumn({ referencedColumnName: 'product_id' })
  flashSaleProducts: FlashSaleProduct[]

  @OneToMany(
    () => ProductPromotion,
    promotion => promotion.product,
  )
  @JoinColumn({ referencedColumnName: 'product_id' })
  productPromotions: ProductPromotion[]
}
