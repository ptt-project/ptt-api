import { transformerDayjsToDate } from "src/utils/entity-transform";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { AppEntity } from "./AppEntity";
import { Member } from "./Member";

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

  @Column({
    name: 'created_date',
    nullable: false,
    transformer: transformerDayjsToDate,
  })
  createdDate: Date

  @ManyToOne(
    () => Member,
    member => member.addresses,
  )
  @JoinColumn({ name: 'seller_id', referencedColumnName: 'id' })
  seller: Member

  @ManyToOne(
    () => Member,
    member => member.addresses,
  )
  @JoinColumn({ name: 'reviewer_id', referencedColumnName: 'id' })
  Reviewer: Member

}