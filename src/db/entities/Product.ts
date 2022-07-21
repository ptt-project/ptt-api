import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { AppEntity } from './AppEntity'
import { CategoryProduct } from './CategoryProduct'
import { PlatformCategory } from './PlatformCategory'
import { ProductProfile } from './ProductProfile'
import { Shop } from './Shop'

@Entity({ name: 'products' })
export class Product extends AppEntity {
  @Column({ name: 'sku', nullable: false })
  sku: string

  @Column({ name: 'product_profile_id', nullable: false })
  productProfileId: number

  @Column({ name: 'shop_id', nullable: false })
  shopId: number

  @Column({ name: 'platform_category_id', nullable: false })
  platformCategoryId: number

  @Column({ name: 'brand_id', nullable: false })
  brandId: number

  @Column({ name: 'option1' })
  option1: string

  @Column({ name: 'option2' })
  option2: string

  @Column({ name: 'price', type: 'decimal', precision: 5, scale: 2 })
  price: number

  @Column({ name: 'stock' })
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
    () => CategoryProduct,
    categoryProduct => categoryProduct.product,
  )
  @JoinColumn({ referencedColumnName: 'product_id' })
  categoryProducts: CategoryProduct[]
}
