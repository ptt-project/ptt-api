import { AppEntity } from './AppEntity'
import { Column, Entity, ManyToOne, JoinColumn, OneToMany } from 'typeorm'
import { Member } from './Member'
import { transformerDecimalToNumber } from 'src/utils/entity-transform'
import { HappyPointTransaction } from './HappyPointTransaction'

@Entity({ name: 'happy_points' })
export class HappyPoint extends AppEntity {
  @Column({ name: 'member_id', nullable: false })
  memberId: number

  @Column({
    name: 'balance',
    nullable: false,
    type: 'decimal',
    precision: 12,
    scale: 4,
    default: 0,
    transformer: transformerDecimalToNumber,
  })
  balance: number

  @Column({
    name: 'limtit_transfer',
    nullable: false,
    type: 'decimal',
    precision: 12,
    scale: 4,
    default: 0,
    transformer: transformerDecimalToNumber,
  })
  limitTransfer: number

  @ManyToOne(
    () => Member,
    member => member.happyPoints,
  )
  @JoinColumn({ name: 'member_id', referencedColumnName: 'id' })
  member: Member

  @OneToMany(
    () => HappyPointTransaction,
    HappyPointTransaction => HappyPointTransaction.fromHappyPoint,
  )
  transactions: HappyPointTransaction[]
}
