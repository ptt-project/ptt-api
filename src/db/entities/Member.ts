import { transformerDayjsToDate } from 'src/utils/entity-transform'
import { Column, Entity, OneToOne, OneToMany, JoinColumn } from 'typeorm'
import { Address } from './Address'
import { AppEntity } from './AppEntity'
import { Mobile } from './Mobile'
import { Shop } from './Shop'

export type MemberGenderType = 'F' | 'M' | 'O'
export type MemberRoleType = 'Buyer' | 'Seller'
@Entity({ name: 'members' })
export class Member extends AppEntity {
  @Column({ name: 'username', nullable: false, length: 50 })
  username: string

  @Column({ name: 'first_name', nullable: false, length: 50 })
  firstName: string

  @Column({ name: 'last_name', nullable: false, length: 50 })
  lastName: string

  @Column({ name: 'password', nullable: false })
  password: string

  @Column({ name: 'mobile', nullable: true, length: 20 })
  mobile: string

  @Column({ name: 'pdpa_status', nullable: true })
  pdpaStatus: boolean

  @Column({
    name: 'birthday',
    type: 'date',
    nullable: true,
    transformer: transformerDayjsToDate,
  })
  birthday: Date

  @Column({ name: 'sp_code_id', nullable: true })
  spCodeId: number

  @OneToOne(() => Member)
  @JoinColumn({ name: 'sp_code_id', referencedColumnName: 'id' })
  spCode: Member

  @Column({
    name: 'gender',
    type: 'enum',
    enum: ['F', 'M', 'O'],
    nullable: true,
  })
  gender: MemberGenderType

  @Column({ name: 'email', nullable: false, length: 50 })
  email: string

  @Column({
    name: 'role',
    type: 'enum',
    enum: ['Buyer', 'Seller'],
    default: 'Buyer',
    nullable: false,
  })
  role: MemberRoleType

  @Column({ name: 'image_id', nullable: true })
  imageId: string

  @OneToMany(
    () => Mobile,
    mobile => mobile.member,
  )
  mobiles: Mobile[]

  @OneToMany(
    () => Address,
    address => address.member,
  )
  @JoinColumn({ referencedColumnName: 'member_id' })
  addresses: Address[]

  @OneToOne(
    () => Shop,
    shop => shop.member,
  )
  shop: Shop
}
