import { Review } from 'src/db/entities/Review'
import { SelectQueryBuilder } from 'typeorm'

export type  InquiryReviewsBySellerIdType = (
  memberId: number,
  isReply: string,
  star: string,
) => Promise<[SelectQueryBuilder<Review>, string]>

export type InquiryReviewsByReviewIdType = (
  commentId: number,
) => Promise<[Review, string]>

export type replyReviewByReviewIdType = (
  memberId: number,
  params: ReplyReviewToDbParams,
) => Promise<string>

export type ReplyReviewToDbParams = {
  reply: string
}
