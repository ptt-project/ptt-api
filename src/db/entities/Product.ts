import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { AppEntity } from './AppEntity'
import { ProductProfile } from './ProductProfile'

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
}
