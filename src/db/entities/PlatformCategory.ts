import { AppEntity } from './AppEntity'
import { Column, Entity, JoinColumn, OneToMany } from 'typeorm'
import { StatusType } from './Category'
import { Product } from './Product'
import { ProductProfile } from './ProductProfile'

@Entity({ name: 'platform_categories' })
export class PlatformCategory extends AppEntity {
  @Column({ name: 'name', nullable: false, length: 40 })
  name: string

  @Column({
    name: 'status',
    type: 'enum',
    enum: ['active', 'inactive'],
    default: 'inactive',
    nullable: false,
  })
  status: StatusType

  @Column({ name: 'product_count', nullable: false, default: 0 })
  productCount: number

  @OneToMany(
    () => Product,
    product => product.platformCategory,
  )
  @JoinColumn({ referencedColumnName: 'platform_category_id' })
  products: Product[]

  @OneToMany(
    () => ProductProfile,
    productProfile => productProfile.platformCategory,
  )
  @JoinColumn({ referencedColumnName: 'platform_category_id' })
  productProfiles: ProductProfile[]
}
