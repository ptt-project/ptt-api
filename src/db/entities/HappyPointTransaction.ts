import { Column, Entity, JoinColumn, ManyToOne, } from "typeorm";
import { AppEntity } from "./AppEntity";
import { Member } from "./Member";

export type HappyPointTransactionType = 'BUY' | 'SELL' | 'TRANSFER' 
export type HappyPointTransactionDetailType = 'CREDIT' | 'DEBIT'
export type HappyPointTransactionStatusType = 'SUCCESS' | 'CANCEL' | 'FAIL' 


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
    name: 'detail',
    type: 'enum',
    enum: ['CREDIT', 'DEBIT'],
    nullable: false,
  })
  detail: HappyPointTransactionDetailType

  @Column({
    name: 'amount',
    type: 'decimal',
    precision: 12,
    scale: 4,
    default: 0,
    nullable: false,
  })
  amount: number

  @Column({ name: 'to_member_id', nullable: false })
  toMemberId: number

  @Column({
    name: 'status',
    type: 'enum',
    enum: ['SUCCESS', 'CANCEL', 'FAIL'],
    nullable: false,
  })
  status: HappyPointTransactionStatusType

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