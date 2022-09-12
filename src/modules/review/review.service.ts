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
} from './review.type'
import { Member } from 'src/db/entities/Member'
import { getReviewQueryDTO, replyCommentRequestDto } from './dto/review.dto'
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
      )(sellerId, query)

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
      sellerId: number,
      params: getReviewQueryDTO
    ): Promise<[SelectQueryBuilder<Review>, string]> => {
      const start = dayjs()
      let reviews: SelectQueryBuilder<Review>
      try {
        reviews = etm
          .createQueryBuilder(Review, 'reviews')
          .innerJoin(
            'reviews.productProfiles',
            'productProfiles',
          )
          .where('reviews.deletedAt IS NULL')
          .andWhere('reviews.sellerId = :sellerId', { sellerId })

        if(params.startDate != undefined){
          const startDate: String = params.startDate + " 00:00:00"
          reviews.andWhere('reviews.createdAt >= :startDate', { startDate })
        }

        if(params.endDate != undefined){
          const endDate: String = params.endDate + " 23:59:59"
          reviews.andWhere('reviews.createdAt <= :endDate ', { endDate })
        }


        if (params.productName != undefined) {
          reviews.andWhere('productProfiles.name ILIKE :queryProductName', { queryProductName: '%'+params.productName+'%' })
        }

        if (params.isReply != undefined) {
          const isReply: String = params.isReply
          reviews.andWhere('reviews.isReply = :isReply', { isReply })
        }

        if (params.star != undefined) {
          const star: String = params.star
          reviews.andWhere('reviews.star = :star', { star })
        }
      } catch (error) {
        return [reviews, error]
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
    return async (reviewId: number) => {
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
    return async (reviewId: number): Promise<[Review, string]> => {
      const start = dayjs()
      let review: Review

      try {
        review = await etm.findOne(Review, reviewId, { withDeleted: false })
      } catch (error) {
        return [review, error]
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
    return async (reviewId: number, body: replyCommentRequestDto) => {
      const start = dayjs()
      const [review, inquiryReviewsByReviewIdError] = await (
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
      reviewId: number,
      params: ReplyReviewToDbParams,
    ): Promise<string> => {
      const start = dayjs()
      try {
        await etm.update(Review, reviewId, { ...params, isReply: true })
      } catch (error) {
        return error
      }

      this.logger.info(
        `Done replyReviewByReviewIdToDbFunc ${dayjs().diff(start)} ms`,
      )
      return ''
    }
  }
}
