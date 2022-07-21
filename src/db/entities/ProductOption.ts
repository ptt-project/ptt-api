import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { AppEntity } from './AppEntity'
import { ProductProfile } from './ProductProfile'

@Entity({ name: 'product_options' })
export class ProductOption extends AppEntity {
  @Column({ name: 'name', nullable: false })
  name: string

  @Column({ name: 'product_profile_id', nullable: false })
  productProfileId: number

  @Column({ name: 'options', type: 'simple-json' })
  options: string[]

  @ManyToOne(
    () => ProductProfile,
    productProfile => productProfile.productOptions,
  )
  @JoinColumn({ name: 'product_profile_id', referencedColumnName: 'id' })
  productProfile: ProductProfile
}
