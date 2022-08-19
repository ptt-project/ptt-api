import { Column, Entity, ManyToOne, JoinColumn, OneToMany } from 'typeorm'
import { AppEntity } from './AppEntity'
import { transformerDayjsToDate } from 'src/utils/entity-transform'
import { Shop } from './Shop'
import { ProductProfilePromotion } from './ProductPromotionPromotion'

export type PromotionType = 'coming soon' | 'expired' | 'active'
@Entity({ name: 'promotions' })
export class Promotion extends AppEntity {
  @Column({ name: 'shopId', nullable: false })
  shopId: number

  @Column({ name: 'name', nullable: false })
  name: string

  @Column({
    name: 'status',
    type: 'enum',
    enum: ['coming soon', 'expired', 'active'],
    default: 'coming soon',
    nullable: false,
  })
  status: PromotionType

  @Column({
    name: 'start_date',
    type: 'timestamp',
    nullable: false,
    transformer: transformerDayjsToDate,
  })
  startDate: Date

  @Column({
    name: 'end_date',
    type: 'timestamp',
    nullable: false,
    transformer: transformerDayjsToDate,
  })
  endDate: Date

  @ManyToOne(
    () => Shop,
    shop => shop.promotions,
  )
  @JoinColumn({ name: 'shop_id', referencedColumnName: 'id' })
  shop: Shop

  @OneToMany(
    () => ProductProfilePromotion,
    productProfilePromotion => productProfilePromotion.promotion,
  )
  @JoinColumn({ referencedColumnName: 'promotion_id' })
  productProfiles: ProductProfilePromotion[]
}
