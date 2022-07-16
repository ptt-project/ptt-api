import { AppEntity } from './AppEntity'
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm'
import { Shop } from './Shop'

export type CreatedByType = 'seller' | 'admin'
export type StatusType = 'active' | 'inactive'

@Entity({ name: 'categories' })
export class Category extends AppEntity {
  @Column({ name: 'shop_id', nullable: false })
  shopId: number

  @Column({ name: 'name', nullable: false, length: 40 })
  name: string

  @Column({
    name: 'created_by',
    type: 'enum',
    enum: ['seller', 'admin'],
    nullable: false,
  })
  createdBy: CreatedByType

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

  @Column({ name: 'priority', nullable: false })
  priority: number

  @ManyToOne(
    () => Shop,
    shop => shop.id,
  )
  @JoinColumn({ name: 'shop_id', referencedColumnName: 'id' })
  shop: Shop
}
