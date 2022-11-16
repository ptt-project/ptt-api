import { AppEntity } from './AppEntity'
import { Column, Entity, JoinColumn, OneToMany } from 'typeorm'
import { StatusType } from './Category'
import { Product } from './Product'
import { ProductProfile } from './ProductProfile'
import { transformerDecimalToNumber } from 'src/utils/entity-transform'

@Entity({ name: 'platform_categories' })
export class PlatformCategory extends AppEntity {
  @Column({ name: 'name_th', nullable: false, length: 40 })
  nameTh: string

  @Column({ name: 'name_en', nullable: false, length: 40 })
  nameEn: string

  @Column({ name: 'icon', nullable: true })
  icon: string

  @Column({
    name: 'status',
    type: 'enum',
    enum: ['active', 'inactive'],
    default: 'inactive',
    nullable: false,
  })
  status: StatusType

  @Column({
    name: 'commission_rate',
    nullable: false,
    type: 'decimal',
    precision: 9,
    scale: 4,
    default: 0,
    transformer: transformerDecimalToNumber,
  })
  commissionRate: number

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
