import { Column, Entity, OneToOne, JoinColumn, OneToMany } from 'typeorm'
import { AppEntity } from './AppEntity'
import { Member } from './Member'
import { Product } from './Product'
import { ProductProfile } from './ProductProfile'

export type ShopType = 'Normal' | 'Mall'
export type ApprovalType = 'requested' | 'rejected' | 'approved'
export type MallApplicantRoleType =
  | 'Brand Owner'
  | 'Exclusive Distributor'
  | 'Non-Exclusive Distributor'
  | 'Retailer'
  | 'Other'

@Entity({ name: 'shops' })
export class Shop extends AppEntity {
  @Column({
    name: 'type',
    type: 'enum',
    enum: ['Normal', 'Mall'],
    nullable: false,
    default: 'Normal',
  })
  type: ShopType

  @Column({ name: 'full_name', nullable: false, length: 50 })
  fullName: string

  @Column({ name: 'mobile', nullable: true, length: 10 })
  mobile: string

  @Column({ name: 'email', nullable: false, length: 50 })
  email: string

  @Column({ name: 'brand_name', nullable: false, length: 50 })
  brandName: string

  @Column({ name: 'category', nullable: false, length: 50 })
  category: string

  @Column({ name: 'website', nullable: true, length: 50 })
  website: string

  @Column({ name: 'facebook_page', nullable: true, length: 50 })
  facebookPage: string

  @Column({ name: 'instagram', nullable: true, length: 50 })
  instagram: string

  @Column({ name: 'social_media', nullable: true, length: 200 })
  socialMedia: string

  @Column({ name: 'note', nullable: true, length: 1000 })
  note: string

  @Column({ name: 'corperate_name', nullable: true, length: 50 })
  corperateName: string

  @Column({ name: 'corperate_id', nullable: true, length: 20 })
  corperateId: string

  @Column({
    name: 'approval_status',
    type: 'enum',
    enum: ['requested', 'rejected', 'approved'],
    nullable: false,
    default: 'requested',
  })
  approvalStatus: ApprovalType

  @Column({ name: 'shop_name', nullable: true, length: 30 })
  shopName: string

  @Column({ name: 'shop_description', nullable: true, length: 500 })
  shopDescription: string

  @Column({ name: 'product_count', nullable: false, default: 0 })
  productCount: number

  @Column({
    name: 'reply_rate',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: false,
    default: 0,
  })
  replyRate: number

  @Column({
    name: 'shop_score',
    type: 'decimal',
    precision: 2,
    scale: 1,
    nullable: false,
    default: 0,
  })
  shopScore: number

  @Column({ name: 'score_count', nullable: false, default: 0 })
  scoreCount: number

  @Column({
    name: 'cancel_rate',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: false,
    default: 0,
  })
  cancelRate: number

  @Column({
    name: 'mall_applicant_role',
    type: 'enum',
    enum: [
      'Brand Owner',
      'Exclusive Distributor',
      'Non-Exclusive Distributor',
      'Retailer',
      'Other',
    ],
    nullable: true,
  })
  mallApplicantRole: MallApplicantRoleType

  @Column({ name: 'mall_offline_shop_detail', nullable: true })
  mallOfflineShopDetail: string

  @Column({ name: 'mall_shop_description', nullable: true })
  mallShopDescription: string

  @Column({ name: 'profile_image_path', nullable: true })
  profileImagePath: string

  @Column({ name: 'cover_image_path', nullable: true })
  coverImagePath: string

  @Column({ name: 'member_id', nullable: true })
  memberId: string

  @OneToOne(
    () => Member,
    member => member.shop,
  )
  @JoinColumn({ name: 'member_id', referencedColumnName: 'id' })
  member: Member

  @OneToMany(
    () => Product,
    product => product.shop,
  )
  @JoinColumn({ referencedColumnName: 'shop_id' })
  products: Product[]

  @OneToMany(
    () => ProductProfile,
    productProfile => productProfile.shop,
  )
  @JoinColumn({ referencedColumnName: 'shop_id' })
  productProfiles: ProductProfile[]
}
