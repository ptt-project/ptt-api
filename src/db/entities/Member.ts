import { transformerDayjsToDate } from 'src/utils/entity-transform'
import {
  Column,
  Entity,
  OneToOne,
  OneToMany,
  JoinColumn,
  ManyToOne,
  Generated,
} from 'typeorm'
import { Address } from './Address'
import { AppEntity } from './AppEntity'
import { HappyPoint } from './HappyPoint'
import { BankAccount } from './BankAccount'
import { Mobile } from './Mobile'
import { Order } from './Order'
import { Review } from './Review'
import { Shop } from './Shop'
import { Wallet } from './Wallet'

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

  @Column({ name: 'member_code', nullable: false, length: 7 })
  memberCode: string

  @Column()
  @Generated('increment')
  no: number

  @Column({ name: 'sp_code_id', nullable: true })
  spCodeId: string

  @ManyToOne(() => Member)
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

  @Column({ name: 'relationIds', type: 'simple-json', default: [] })
  relationIds: string[]

  @Column({ name: 'image_id', nullable: true })
  imageId: string

  @Column({ name: 'login_token', nullable: true })
  loginToken: string

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

  @OneToMany(
    () => Wallet,
    wallet => wallet.member,
  )
  wallets: Wallet[]

  @OneToMany(
    () => HappyPoint,
    happyPoint => happyPoint.member,
  )
  happyPoints: HappyPoint[]

  @OneToMany(
    () => BankAccount,
    bankAccount => bankAccount.member,
  )
  bankAccounts: BankAccount[]

  @OneToMany(
    () => Order,
    order => order.member,
  )
  @JoinColumn({ referencedColumnName: 'member_id' })
  order: Order[]

  @OneToMany(
    () => Review,
    review => review.reviewer,
  )
  @JoinColumn({ referencedColumnName: 'member_id' })
  reviews: Review[]
}
