import { Column, Entity, JoinColumn, OneToOne } from 'typeorm'
import { AppEntity } from './AppEntity'
import { Shop } from './Shop'

@Entity({ name: 'conditions' })
export class Condition extends AppEntity {

  @Column({ name: 'shop_id' })
  shopId: string

  @Column({ name: 'count_person', default: 0, nullable: false })
  countPerson: number

  @Column({ name: 'count_person_status', default: false, nullable: false})
  countPersonStatus: boolean

  @Column({ name: 'count_order', default: 0, nullable: false })
  countOrder: number

  @Column({ name: 'count_order_status', default: false, nullable: false })
  countOrderStatus: boolean

  @Column({ name: 'total_sale', default: 0, nullable: false })
  totalSale: number

  @Column({ name: 'total_sale_status', default: false, nullable: false })
  totalSaleStatus: boolean

  @Column({ name: 'score_rate', default: 0, nullable: false })
  scoreRate: number

  @Column({ name: 'score_rate_status', default: false, nullable: false })
  scoreRateStatus: boolean

  @Column({ name: 'failed_order_rate', default: 0, nullable: false })
  failedOrderRate: number

  @Column({ name: 'failed_order_rate_status', default: false, nullable: false })
  failedOrderRateStatus: boolean

  @Column({ name: 'delayed_delivery_rate', default: 0, nullable: false })
  delayedDeliveryRate: number

  @Column({ name: 'delayed_delivery_rate_status', default: false, nullable: false })
  delayedDeliveryRateStatus: boolean

  @OneToOne(
    () => Shop,
    shop => shop.condition,
  )
  @JoinColumn({ name: 'shop_id', referencedColumnName: 'id' })
  shop: Shop

}