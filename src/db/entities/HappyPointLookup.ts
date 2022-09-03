import { Column, Entity, Index } from 'typeorm'
import { AppEntity } from './AppEntity'

@Index(['refId'])
@Entity({ name: 'happy_point_look_up' })
export class HappyPointLookup extends AppEntity {
  @Column({ name: 'ref_id', nullable: false })
  refId: string

  @Column({
    name: 'exchange_rate',
    type: 'decimal',
    precision: 12,
    scale: 4,
    default: 0,
    nullable: false,
  })
  exchangeRate: number

  @Column({ name: 'member_id', nullable: false })
  memberId: number
}
