import { Injectable } from '@nestjs/common'
import { response } from 'src/utils/response'
import { Review } from 'src/db/entities/Review'
import { UnableInquiryCommentsById, UnableInquiryCommentsByMemberId, UnableReplyCommentToDb } from 'src/utils/response-code'
import { EntityManager } from 'typeorm'
import { InquiryCommentsByIdType, InquiryCommentsMemberIdType, ReplyCommentByIdType, ReplyCommentToDbParams } from './review.type'
import { Member } from 'src/db/entities/Member'
import { getReviewQueryDTO, replyCommentRequestDto } from './dto/review.dto'
import { PinoLogger } from 'nestjs-pino'
import dayjs from 'dayjs'

@Injectable()
export class ReviewService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(ReviewService.name)
  }


  getCommentsByMemberIdHandler(
    InquiryCommentsByMemberId: Promise<InquiryCommentsMemberIdType>,
  ) {
    return async (member: Member, query? : getReviewQueryDTO) => {
      const start = dayjs()
      const { id: sellerId } = member

      const [review, inquiryCommentsError] = await (
        await InquiryCommentsByMemberId
      )(sellerId, query.isReply, query.star)

      if(inquiryCommentsError != ''){
        response(
            undefined,
            UnableInquiryCommentsByMemberId,
            inquiryCommentsError,
          )
      }

      this.logger.info(`Done getCommentsByMemberIdHandler ${dayjs().diff(start)} ms`)
      return response(review)
    }

  }

  async InquiryCommentsByMemberIdFunc(
    etm: EntityManager,
  ): Promise<InquiryCommentsMemberIdType> {
    return async (sellerId: number, isReply?: string, star?: string): Promise<[Review[], string]> => {
      const start = dayjs()
      let review: Review[]
      
      try {
        if(isReply != null && star != null){
          review = await etm
          .getRepository(Review)
          .find({ withDeleted: false ,where: { sellerId, isReply, star} })
        } else if(isReply != null && star == null) {
          review = await etm
          .getRepository(Review)
          .find({ withDeleted: false ,where: { sellerId, isReply} })
        } else if(isReply == null && star != null) {
          review = await etm
          .getRepository(Review)
          .find({ withDeleted: false ,where: { sellerId, star} })
        } else {
          review = await etm
            .getRepository(Review)
            .find({ withDeleted: false ,where: { sellerId} })
        }
      } catch (error) {
        return [review, error]
      }

      this.logger.info(`Done InquiryCommentsByMemberIdFunc ${dayjs().diff(start)} ms`)
      return [review, '']
    }
  }

  getCommentsHandler(inquiryCommentsById: Promise<InquiryCommentsByIdType>) {
    return async (commentId: number) => {
      const start = dayjs()
      const [review, inquiryCommentsByIdError] = await (
        await inquiryCommentsById
      )(commentId)

      if (inquiryCommentsByIdError != '') {
        return response(
          undefined,
          UnableInquiryCommentsById,
          inquiryCommentsByIdError,
        )
      }

      this.logger.info(`Done getCommentsHandler ${dayjs().diff(start)} ms`)
      return response(review)
    }
  }

  async InquiryCommentsByIdFunc(
    etm: EntityManager,
  ): Promise<InquiryCommentsByIdType> {
    return async (commentId: number): Promise<[Review, string]> => {
      const start = dayjs()
      let review: Review
      try {
        review = await etm
          .getRepository(Review)
          .findOne(commentId, { withDeleted: false })
      } catch (error) {
        return [review, error]
      }

      if (!review) {
        return [review, 'Not found Comment']
      }

      this.logger.info(`Done InquiryCommentsByIdFunc ${dayjs().diff(start)} ms`)
      return [review, '']
    }
  }

  replyCommentByIdHandler(
    inquiryCommentsById: Promise<InquiryCommentsByIdType>,
    replyCommentByIdToDb: Promise<ReplyCommentByIdType>,
  ) {
    return async (
      commentId: number, 
      body: replyCommentRequestDto,
    ) => {
      const start = dayjs()
      const [review, inquiryCommentsByIdError] = await (
        await inquiryCommentsById
      )(commentId)

      if (inquiryCommentsByIdError != '') {
        return response(
          undefined,
          UnableInquiryCommentsById,
          inquiryCommentsByIdError,
        )
      }

      const replyCommentByIdToDbError = await (await replyCommentByIdToDb)(
        commentId,
        body,
      )

      if (replyCommentByIdToDbError != '') {
        return response(
          undefined,
          UnableReplyCommentToDb,
          replyCommentByIdToDbError,
        )
      }

      this.logger.info(`Done replyCommentByIdHandler ${dayjs().diff(start)} ms`)
      return response(undefined)
    }
  }

  async replyCommentByIdToDbFunc(
    etm: EntityManager,
  ): Promise<ReplyCommentByIdType> {
    return async (
      commentId: number,
      params: ReplyCommentToDbParams,
    ): Promise<string> => {
      const start = dayjs()
      try {
        await etm.getRepository(Review).update(commentId, { ...params, isReply: true } )
      } catch (error) {
        return error
      }

      this.logger.info(`Done replyCommentByIdToDbFunc ${dayjs().diff(start)} ms`)
      return ''
    }
  }

}
