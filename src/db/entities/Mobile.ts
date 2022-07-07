import { AppEntity } from './AppEntity'
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm'
import { Member } from './Member'

@Entity({ name: 'mobiles' })
export class Mobile extends AppEntity {
  @Column({ name: 'member_id', nullable: false })
  memberId: number

  @Column({ name: 'mobile', nullable: false, length: 20 })
  mobile: string

  @Column({ name: 'is_primary', nullable: false, default: false })
  isPrimary: boolean

  @ManyToOne(
    () => Member,
    member => member.addresses,
  )
  @JoinColumn({ name: 'member_id', referencedColumnName: 'id' })
  member: Member
}
