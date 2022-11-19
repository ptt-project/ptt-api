import { Review } from 'src/db/entities/Review'
import { SelectQueryBuilder } from 'typeorm'
import { GetReviewWithSellerQueryDto } from '../dto/review.dto'

export type InquiryReviewsWithSellerParams = {
  limit?: number
  page?: number
  isReply?: string
  star?: string
  productName?: string
  startDate?: Date
  endDate?: Date
}

export type InquiryReviewsWithSellerByShopIdType = (
  shopId: string,
  params: InquiryReviewsWithSellerParams,
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
}

export type InquiryReviewsByShopIdType = (
  shopId: string,
) => [SelectQueryBuilder<Review>, string]
