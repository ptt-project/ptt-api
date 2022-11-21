import { Review } from 'src/db/entities/Review'
import { SelectQueryBuilder } from 'typeorm'
import { GetReviewOfSellerQueryDto } from '../dto/review.dto'

export type InquiryReviewsOfSellerParams = {
  limit?: number
  page?: number
  isReply?: string
  star?: string
  productName?: string
  startDate?: Date
  endDate?: Date
}

export type InquiryReviewsOfSellerByShopIdType = (
  shopId: string,
  params: InquiryReviewsOfSellerParams,
) => [SelectQueryBuilder<Review>, string]

export type InquiryReviewsByReviewIdType = (
  reviewId: string,
) => Promise<[Review, string]>

export type ReplyReviewByReviewIdType = (
  reviewId: string,
  params: ReplyReviewToDbParams,
) => Promise<string>

export type ReplyReviewToDbParams = {
  reply: string
}

export type InquiryReviewsParams = {
  limit?: number
  page?: number
  star?: string
}

export type InquiryReviewsByProductProfileIdType = (
  shopId: string,
  params: InquiryReviewsParams,
) => [SelectQueryBuilder<Review>, string]
