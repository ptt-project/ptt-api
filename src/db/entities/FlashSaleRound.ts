import { transformerDayjsToDate } from 'src/utils/entity-transform'
import { Column, Entity, JoinColumn, OneToMany } from 'typeorm'
import { AppEntity } from './AppEntity'
import { FlashSale } from './FlashSale'

@Entity({ name: 'flash_sale_rounds' })
export class FlashSaleRound extends AppEntity {
  @Column({
    name: 'date',
    type: 'timestamp',
    nullable: false,
    transformer: transformerDayjsToDate,
  })
  date: Date

  @Column({
    name: 'start_time', 
    type: 'timestamp',
    nullable: false,
    transformer: transformerDayjsToDate,
  })
  startTime: Date

  @Column({
    name: 'end_time', 
    type: 'timestamp',
    nullable: false,
    transformer: transformerDayjsToDate,
  })
  endTime: Date

  @OneToMany(
    () => FlashSale,
    flashSale => flashSale.round,
  )
  @JoinColumn({  referencedColumnName: 'round_id' })
  flashSales: FlashSale[]
}
