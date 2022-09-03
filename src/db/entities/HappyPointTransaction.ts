import { Column, Entity, JoinColumn, ManyToOne, Index } from 'typeorm'
import { AppEntity } from './AppEntity'
import { Member } from './Member'

export type HappyPointTransactionType = 'BUY' | 'SELL' | 'TRANSFER'
export type HappyPointTransactionNote = 'CREDIT' | 'DEBIT'
export type HappyPointTransactionStatusType =
  | 'SUCCESS'
  | 'CANCEL'
  | 'FAIL'
  | 'PENDING'

@Index(['fromMemberId', 'refId'], {
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

  @Column({ name: 'from_member_id', nullable: false })
  fromMemberId: number

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
  })
  point: number

  @Column({ name: 'to_member_id', nullable: true })
  toMemberId?: number

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
  })
  totalAmount: number

  @Column({
    name: 'exchange_rate',
    type: 'decimal',
    precision: 12,
    scale: 4,
    nullable: false,
  })
  exchangeRate: number

  @Column({
    name: 'fee',
    type: 'decimal',
    precision: 12,
    scale: 4,
    default: 0,
    nullable: true,
  })
  fee?: number

  @Column({
    name: 'amount',
    type: 'decimal',
    precision: 12,
    scale: 4,
    default: 0,
    nullable: true,
  })
  amount: number

  @ManyToOne(
    () => Member,
    member => member.fromMemberHappyPointTransactions,
  )
  @JoinColumn({ name: 'from_member_id', referencedColumnName: 'id' })
  fromMember: Member

  @ManyToOne(
    () => Member,
    member => member.toMemberHappyPointTransactions,
  )
  @JoinColumn({ name: 'to_member_id', referencedColumnName: 'id' })
  toMember: Member
}
