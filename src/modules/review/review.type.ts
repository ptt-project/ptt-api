import { Review } from 'src/db/entities/Review'
import { SelectQueryBuilder } from 'typeorm'
import { getReviewQueryDTO } from './dto/review.dto'

export type  InquiryReviewsBySellerIdType = (
  memberId: number,
  params: getReviewQueryDTO
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
