import { Review } from 'src/db/entities/Review'
import { SelectQueryBuilder } from 'typeorm'
import { GetReviewQueryDto } from '../dto/review.dto'

export type InquiryReviewsParams = {
  limit?: number
  page?: number
  isReply?: string
  star?: string
  productName?: string
  startDate?: Date
  endDate?: Date
}

export type InquiryReviewsByShopIdType = (
  memberId: string,
  params: InquiryReviewsParams,
) => [SelectQueryBuilder<Review>, string]

export type InquiryReviewsByReviewIdType = (
  commentId: string,
) => Promise<[Review, string]>

export type ReplyReviewByReviewIdType = (
  memberId: string,
  params: ReplyReviewToDbParams,
) => Promise<string>

export type ReplyReviewToDbParams = {
  reply: string
}
