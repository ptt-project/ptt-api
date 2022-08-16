import { Column, Entity, JoinColumn, OneToOne } from 'typeorm'
import { AppEntity } from './AppEntity'
import { Shop } from './Shop'

@Entity({ name: 'conditions' })
export class Condition extends AppEntity {

  @Column({ name: 'shop_id' })
  shopId: number

  @Column({ name: 'count_person', default: 0, nullable: true })
  countPerson: number

  @Column({ name: 'count_person_status', default: false, nullable: true})
  countPersonStatus: boolean

  @Column({ name: 'count_order', default: 0, nullable: true })
  countOrder: number

  @Column({ name: 'count_order_status', default: false, nullable: true })
  countOrderStatus: boolean

  @Column({ name: 'total_sale', default: 0, nullable: true })
  totalSale: number

  @Column({ name: 'total_sale_status', default: false, nullable: true })
  totalSaleStatus: boolean

  @Column({ name: 'score_rate', default: 0, nullable: true })
  scoreRate: number

  @Column({ name: 'score_rate_status', default: false, nullable: true })
  scoreRateStatus: boolean

  @Column({ name: 'failed_order_rate', default: 0, nullable: true })
  failedOrderRate: number

  @Column({ name: 'failed_order_rate_status', default: false, nullable: true })
  failedOrderRateStatus: boolean

  @Column({ name: 'delayed_delivery_rate', default: 0, nullable: true })
  delayedDeliveryRate: number

  @Column({ name: 'delayed_delivery_rate_status', default: false, nullable: true })
  delayedDeliveryRateStatus: boolean

  @OneToOne(
    () => Shop,
    shop => shop.condition,
  )
  @JoinColumn({ name: 'shop_id', referencedColumnName: 'id' })
  shop: Shop

}