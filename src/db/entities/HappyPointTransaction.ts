import { Column, Entity, JoinColumn, ManyToOne, Index } from 'typeorm'
import { AppEntity } from './AppEntity'
import { HappyPoint } from './HappyPoint'
import { transformerDecimalToNumber } from 'src/utils/entity-transform'

export type HappyPointTransactionType = 'BUY' | 'SELL' | 'TRANSFER'
export type HappyPointTransactionNote = 'CREDIT' | 'DEBIT'
export type HappyPointTransactionStatusType =
  | 'SUCCESS'
  | 'CANCEL'
  | 'FAIL'
  | 'PENDING'

@Index(['fromHappyPointId', 'refId'], {
  unique: true,
})
@Entity({ name: 'happy_point_transactions' })
export class HappyPointTransaction extends AppEntity {
  @Column({ name: 'ref_id', nullable: false })
  refId: string

  @Column({
    name: 'type',
    type: 'enum',
    enum: ['BUY', 'SELL', 'TRANSFER'],
    nullable: false,
  })
  type: HappyPointTransactionType

  @Column({ name: 'from_happy_point_id', nullable: false })
  fromHappyPointId: string

  @Column({
    name: 'note',
    type: 'enum',
    enum: ['CREDIT', 'DEBIT'],
    nullable: false,
  })
  note: HappyPointTransactionNote

  @Column({
    name: 'point',
    type: 'decimal',
    precision: 12,
    scale: 4,
    nullable: false,
    transformer: transformerDecimalToNumber,
  })
  point: number

  @Column({ name: 'to_happy_point_id', nullable: true })
  toHappyPointId?: string

  @Column({
    name: 'status',
    type: 'enum',
    enum: ['SUCCESS', 'CANCEL', 'FAIL', 'PENDING'],
    nullable: false,
  })
  status: HappyPointTransactionStatusType

  @Column({
    name: 'total_amount',
    type: 'decimal',
    precision: 12,
    scale: 4,
    nullable: true,
    transformer: transformerDecimalToNumber,
  })
  totalAmount?: number

  @Column({
    name: 'exchange_rate',
    type: 'decimal',
    precision: 12,
    scale: 4,
    nullable: false,
    transformer: transformerDecimalToNumber,
  })
  exchangeRate: number

  @Column({
    name: 'fee',
    type: 'decimal',
    precision: 12,
    scale: 4,
    default: 0,
    nullable: true,
    transformer: transformerDecimalToNumber,
  })
  fee?: number

  @Column({
    name: 'amount',
    type: 'decimal',
    precision: 12,
    scale: 4,
    default: 0,
    nullable: true,
    transformer: transformerDecimalToNumber,
  })
  amount?: number

  @Column({
    name: 'total_point',
    type: 'decimal',
    precision: 12,
    scale: 4,
    nullable: true,
    transformer: transformerDecimalToNumber,
  })
  totalPoint?: number

  @Column({
    name: 'fee_point',
    type: 'decimal',
    precision: 12,
    scale: 4,
    default: 0,
    nullable: true,
    transformer: transformerDecimalToNumber,
  })
  feePoint?: number

  @ManyToOne(
    () => HappyPoint,
    HappyPoint => HappyPoint.transactions,
  )
  @JoinColumn({ name: 'from_happy_point_id', referencedColumnName: 'id' })
  fromHappyPoint: HappyPoint

  @ManyToOne(
    () => HappyPoint,
    HappyPoint => HappyPoint.transactions,
    { createForeignKeyConstraints: false },
  )
  @JoinColumn({ name: 'to_happy_point_id', referencedColumnName: 'id' })
  toHappyPoint: HappyPoint
}
