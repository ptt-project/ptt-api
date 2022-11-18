import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { AppEntity } from './AppEntity'
import { Member } from './Member'
import { ProductProfile } from './ProductProfile'
import { Shop } from './Shop'

@Entity({ name: 'reviews' })
export class Review extends AppEntity {
  @Column({ name: 'shop_id', nullable: false })
  shopId: string

  @Column({ name: 'comment', nullable: true })
  comment: string

  @Column({ name: 'reply', nullable: true })
  reply: string

  @Column({ name: 'star', default: 0, nullable: false })
  star: number

  @Column({ name: 'is_reply', nullable: false, default: false })
  isReply: boolean

  @Column({ name: 'is_hide', nullable: false, default: false })
  isHide: boolean

  @Column({ name: 'reviewer_id', nullable: false })
  reviewerId: string

  @Column({ name: 'product_profile_id', type: 'uuid' })
  productProfileId: string

  @ManyToOne(
    () => Shop,
    shop => shop.reviews,
  )
  @JoinColumn({ name: 'shop_id', referencedColumnName: 'id' })
  shop: Shop

  @ManyToOne(
    () => Member,
    member => member.reviews,
  )
  @JoinColumn({ name: 'reviewer_id', referencedColumnName: 'id' })
  reviewer: Member

  @ManyToOne(
    () => ProductProfile,
    productProfile => productProfile.reviews,
    { createForeignKeyConstraints: false },
  )
  @JoinColumn({ name: 'product_profile_id' })
  productProfile: ProductProfile
}
