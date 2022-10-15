import { Column, Entity, ManyToOne, JoinColumn, OneToMany } from 'typeorm'
import { AppEntity } from './AppEntity'
import { transformerDayjsToDate } from 'src/utils/entity-transform'
import { Shop } from './Shop'
import { ProductPromotion } from './ProductPromotion'

@Entity({ name: 'promotions' })
export class Promotion extends AppEntity {
  @Column({ name: 'shop_id', nullable: false })
  shopId: number

  @Column({ name: 'name', nullable: false })
  name: string

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
    () => ProductPromotion,
    productPromotion => productPromotion.promotion,
  )
  @JoinColumn({ referencedColumnName: 'promotion_id' })
  products: ProductPromotion[]
}
