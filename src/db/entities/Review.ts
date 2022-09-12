import { transformerDayjsToDate } from "src/utils/entity-transform";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { AppEntity } from "./AppEntity";
import { Member } from "./Member";
import { ProductProfile } from "./ProductProfile";

@Entity({ name: 'reviews' })
export class Review extends AppEntity {
    
  @Column({ name: 'seller_id', nullable: false })
  sellerId: number

  @Column({ name: 'comment', nullable: true })
  comment: string

  @Column({ name: 'reply', nullable: true })
  reply: string

  @Column({ name: 'star', nullable: true })
  star: number

  @Column({ name: 'is_reply', nullable: false, default: false })
  isReply: boolean

  @Column({ name: 'is_hide', nullable: false, default: false })
  isHide: boolean

  @Column({ name: 'reviewer_id', nullable: false })
  reviewerId: number

  @Column({ name: 'product_profile_id', nullable: false })
  productProfileId: number

  @ManyToOne(
    () => Member,
    member => member.sellers,
  )
  @JoinColumn({ name: 'seller_id', referencedColumnName: 'id' })
  seller: Member

  @ManyToOne(
    () => Member,
    member => member.reviews,
  )
  @JoinColumn({ name: 'reviewer_id', referencedColumnName: 'id' })
  reviewer: Member

  @ManyToOne(
    () => ProductProfile,
    productProfile => productProfile.reviews,
  )
  @JoinColumn({ name: 'product_profile_id', referencedColumnName: 'id' })
  productProfiles: ProductProfile

}