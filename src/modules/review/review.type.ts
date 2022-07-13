import { Review } from "src/db/entities/Review";

export type InquiryCommentsMemberIdType = (
  memberId: number,
  isReply: string, 
  star: string,
) => Promise<[Review[], string]>

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