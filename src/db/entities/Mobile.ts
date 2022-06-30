import { AppEntity } from './AppEntity'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { Member } from './Member'

@Entity({ name: 'mobiles' })
export class Mobile extends AppEntity {
  @Column({ name: 'mobile', nullable: false, length: 20 })
  mobile: string

  @ManyToOne(() => Member, member => member.mobiles)
  member: Member

  @Column({ name: 'is_primary', nullable: false, default: false })
  isPrimary: boolean
}
