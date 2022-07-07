import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm'
import { AppEntity } from './AppEntity'
import { Member } from './Member'

export type StatusType = 'send' | 'verified'
@Entity({ name: 'addresses' })
export class Address extends AppEntity {
  @Column({ name: 'name', nullable: false })
  name: string

  @Column({ name: 'mobile', nullable: false, length: 20 })
  mobile: string

  @Column({ name: 'member_id', nullable: false })
  memberId: number

  @Column({ name: 'province', nullable: false })
  province: string

  @Column({ name: 'tambon', nullable: true })
  tambon: string

  @Column({ name: 'district', nullable: false })
  district: string

  @Column({ name: 'postcode', nullable: false, length: 5 })
  postcode: string

  @Column({ name: 'address', nullable: true })
  address: string

  @Column({ name: 'geo_name', nullable: true })
  geoName: string

  @Column({ name: 'is_main', nullable: true })
  isMain: boolean

  @Column({ name: 'is_home', nullable: true })
  isHome: boolean

  @Column({ name: 'is_work', nullable: true })
  isWork: boolean

  @ManyToOne(
    () => Member,
    member => member.addresses,
  )
  @JoinColumn({ name: 'member_id', referencedColumnName: 'id' })
  member: Member
}
