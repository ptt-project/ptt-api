import { Injectable } from '@nestjs/common'
import { response } from 'src/utils/response'
import { Review } from 'src/db/entities/Review'
import {
  UnableInquiryReviewsByReviewId,
  UnableInquiryInquiryReviewsBySellerId,
  UnableReplyReviewByReviewId,
} from 'src/utils/response-code'
import { EntityManager, SelectQueryBuilder } from 'typeorm'
import {
  InquiryReviewsByReviewIdType,
  InquiryReviewsBySellerIdType,
  replyReviewByReviewIdType,
  ReplyReviewToDbParams,
} from '../type/review.type'
import { Member } from 'src/db/entities/Member'
import { getReviewQueryDTO, replyCommentRequestDto } from '../dto/review.dto'
import { PinoLogger } from 'nestjs-pino'
import dayjs from 'dayjs'
import { paginate } from 'nestjs-typeorm-paginate'

@Injectable()
export class ReviewService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(ReviewService.name)
  }

  getReviewsBySellerIdHandler(
    InquiryReviewsBySellerId: Promise<InquiryReviewsBySellerIdType>,
  ) {
    return async (member: Member, query?: getReviewQueryDTO) => {
      const start = dayjs()
      const { id: sellerId } = member
      const { isReply, star, limit = 10, page = 1 } = query

      const [reviews, inquiryCommentsError] = await (
        await InquiryReviewsBySellerId
      )(sellerId, isReply, star)

      if (inquiryCommentsError != '') {
        response(
          undefined,
          UnableInquiryInquiryReviewsBySellerId,
          inquiryCommentsError,
        )
      }

      const result = await paginate<Review>(reviews, { limit, page })
      this.logger.info(
        `Done paginate InquiryReviewsBySellerIdFunc ${dayjs().diff(start)} ms`,
      )

      this.logger.info(
        `Done getReviewsBySellerIdHandler ${dayjs().diff(start)} ms`,
      )
      return response(result)
    }
  }

  async InquiryReviewsBySellerIdFunc(
    etm: EntityManager,
  ): Promise<InquiryReviewsBySellerIdType> {
    return async (
      sellerId: string,
      isReply?: string,
      star?: string,
    ): Promise<[SelectQueryBuilder<Review>, string]> => {
      const start = dayjs()
      let reviews: SelectQueryBuilder<Review>
      try {
        reviews = etm
          .createQueryBuilder(Review, 'reviews')
          .where('reviews.deletedAt IS NULL')
          .andWhere('reviews.sellerId = :sellerId', { sellerId })

        if (isReply) {
          reviews.andWhere('reviews.isReply = :isReply', { isReply })
        }

        if (star) {
          reviews.andWhere('reviews.star = :star', { star })
        }
      } catch (error) {
        return [reviews, error.message]
      }

      this.logger.info(
        `Done InquiryReviewsBySellerIdFunc ${dayjs().diff(start)} ms`,
      )

      return [reviews, '']
    }
  }

  getReviewsByReviewIdHandler(
    InquiryReviewsByReviewId: Promise<InquiryReviewsByReviewIdType>,
  ) {
    return async (reviewId: string) => {
      const start = dayjs()
      const [review, InquiryReviewsByReviewIdError] = await (
        await InquiryReviewsByReviewId
      )(reviewId)

      if (InquiryReviewsByReviewIdError != '') {
        return response(
          undefined,
          UnableInquiryReviewsByReviewId,
          InquiryReviewsByReviewIdError,
        )
      }

      this.logger.info(
        `Done getReviewsByReviewIdHandler ${dayjs().diff(start)} ms`,
      )
      return response(review)
    }
  }

  async InquiryReviewsByReviewIdFunc(
    etm: EntityManager,
  ): Promise<InquiryReviewsByReviewIdType> {
    return async (reviewId: string): Promise<[Review, string]> => {
      const start = dayjs()
      let review: Review

      try {
        review = await etm.findOne(Review, reviewId, { withDeleted: false })
      } catch (error) {
        return [review, error.message]
      }

      if (!review) {
        return [review, 'Not found Comment']
      }

      this.logger.info(
        `Done InquiryReviewsByReviewIdFunc ${dayjs().diff(start)} ms`,
      )
      return [review, '']
    }
  }

  replyReviewByReviewIdHandler(
    InquiryReviewsByReviewId: Promise<InquiryReviewsByReviewIdType>,
    replyReviewByReviewIdToDb: Promise<replyReviewByReviewIdType>,
  ) {
    return async (reviewId: string, body: replyCommentRequestDto) => {
      const start = dayjs()
      const [, inquiryReviewsByReviewIdError] = await (
        await InquiryReviewsByReviewId
      )(reviewId)

      if (inquiryReviewsByReviewIdError != '') {
        return response(
          undefined,
          UnableInquiryReviewsByReviewId,
          inquiryReviewsByReviewIdError,
        )
      }

      const replyReviewByReviewIdToDError = await (
        await replyReviewByReviewIdToDb
      )(reviewId, body)

      if (replyReviewByReviewIdToDError != '') {
        return response(
          undefined,
          UnableReplyReviewByReviewId,
          replyReviewByReviewIdToDError,
        )
      }

      this.logger.info(
        `Done replyReviewByReviewIdHandler ${dayjs().diff(start)} ms`,
      )
      return response(undefined)
    }
  }

  async replyReviewByReviewIdToDbFunc(
    etm: EntityManager,
  ): Promise<replyReviewByReviewIdType> {
    return async (
      reviewId: string,
      params: ReplyReviewToDbParams,
    ): Promise<string> => {
      const start = dayjs()
      try {
        await etm.update(Review, reviewId, { ...params, isReply: true })
      } catch (error) {
        return error.message
      }

      this.logger.info(
        `Done replyReviewByReviewIdToDbFunc ${dayjs().diff(start)} ms`,
      )
      return ''
    }
  }
}
