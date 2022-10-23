import { AppEntity } from './AppEntity'
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm'
import { Category } from './Category'
import { ProductProfile } from './ProductProfile'

@Entity({ name: 'category_product_profiles' })
export class CategoryProductProfile extends AppEntity {
  @Column({ name: 'category_id', nullable: false })
  categoryId: string

  @Column({ name: 'product_profile_id', nullable: false })
  productProfileId: string

  @ManyToOne(
    () => Category,
    category => category.categoryProductProfiles,
  )
  @JoinColumn({ name: 'category_id', referencedColumnName: 'id' })
  category: Category

  @ManyToOne(
    () => ProductProfile,
    productProfile => productProfile.categoryProductProfiles,
    { createForeignKeyConstraints: false },
  )
  @JoinColumn({ name: 'product_profile_id' })
  productProfile: ProductProfile
}
