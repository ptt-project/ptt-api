import { Review } from 'src/db/entities/Review'
import { SelectQueryBuilder } from 'typeorm'

export type InquiryCommentsMemberIdType = (
  memberId: number,
  isReply: string,
  star: string,
) => Promise<[SelectQueryBuilder<Review>, string]>

export type InquiryCommentsByIdType = (
  commentId: number,
) => Promise<[Review, string]>

export type ReplyCommentByIdType = (
  memberId: number,
  params: ReplyCommentToDbParams,
) => Promise<string>

export type ReplyCommentToDbParams = {
  reply: string
}
