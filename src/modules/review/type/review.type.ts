import { Review } from 'src/db/entities/Review'
import { SelectQueryBuilder } from 'typeorm'

export type InquiryReviewsBySellerIdType = (
  memberId: string,
  isReply: string,
  star: string,
) => Promise<[SelectQueryBuilder<Review>, string]>

export type InquiryReviewsByReviewIdType = (
  commentId: string,
) => Promise<[Review, string]>

export type replyReviewByReviewIdType = (
  memberId: string,
  params: ReplyReviewToDbParams,
) => Promise<string>

export type ReplyReviewToDbParams = {
  reply: string
}
