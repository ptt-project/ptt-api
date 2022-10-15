import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { AppEntity } from './AppEntity'
import { FlashSaleProduct } from './FlashSaleProduct'
import { FlashSaleRound } from './FlashSaleRound'
import { Shop } from './Shop'

export type StatusType = 'active' | 'inactive'

@Entity({ name: 'flash_sales' })
export class FlashSale extends AppEntity {
  @Column({
    name: 'shop_id',
    nullable: false,
  })
  shopId: number

  @Column({
    name: 'round_id', 
    nullable: false,
  })
  roundId: number

  @Column({
    name: 'status',
    type: 'enum',
    enum: ['active', 'inactive'],
    default: 'inactive',
    nullable: false,
  })
  status: StatusType

  @Column({
    name: 'visit_count', 
    default: 0,
  })
  visitCount: number

  @ManyToOne(
    () => Shop,
    shop => shop.flashSales,
  )
  @JoinColumn({ name: 'shop_id', referencedColumnName: 'id' })
  shop: Shop

  @ManyToOne(
    () => FlashSaleRound,
    flashSaleRound => flashSaleRound.flashSales,
  )
  @JoinColumn({ name: 'round_id', referencedColumnName: 'id' })
  round: FlashSaleRound

  @OneToMany(
    () => FlashSaleProduct,
    flashSaleProduct => flashSaleProduct.flashSale,
  )
  @JoinColumn({ referencedColumnName: 'flash_sale_id'})
  products: FlashSaleProduct[]
}
