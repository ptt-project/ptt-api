import { AppEntity } from './AppEntity'
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm'
import { Category } from './Category'
import { Product } from './Product'

@Entity({ name: 'category_products' })
export class CategoryProduct extends AppEntity {
  @Column({ name: 'category_id', nullable: false })
  categoryId: number

  @Column({ name: 'product_id', nullable: false })
  productId: number

  @ManyToOne(
    () => Category,
    category => category.categoryProducts,
  )
  @JoinColumn({ name: 'category_id', referencedColumnName: 'id' })
  category: Category
}
