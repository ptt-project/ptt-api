import { Injectable } from '@nestjs/common'
import { response } from 'src/utils/response'
import { Review } from 'src/db/entities/Review'
import {
  UnableInquiryReviewsByReviewId,
  UnableInquiryInquiryReviewsByShopId,
  UnableReplyReviewByReviewId,
  UnableInquiryInquiryReviewsByProductProfileId,
} from 'src/utils/response-code'
import { EntityManager, SelectQueryBuilder } from 'typeorm'
import {
  InquiryReviewsByProductProfileIdType,
  InquiryReviewsByReviewIdType,
  InquiryReviewsOfSellerByShopIdType,
  InquiryReviewsOfSellerParams,
  ReplyReviewByReviewIdType,
  ReplyReviewToDbParams,
  InquiryReviewsParams,
} from '../type/review.type'
import {
  GetReviewQueryDto,
  GetReviewOfSellerQueryDto,
  ReplyCommentRequestDto,
} from '../dto/review.dto'
import { PinoLogger } from 'nestjs-pino'
import dayjs from 'dayjs'
import { paginate } from 'nestjs-typeorm-paginate'
import { Shop } from 'src/db/entities/Shop'

@Injectable()
export class ReviewService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(ReviewService.name)
  }

  GetReviewsOfSellerByShopIdHandler(
    inquiryReviewsOfSellerByShopId: InquiryReviewsOfSellerByShopIdType,
  ) {
    return async (shop: Shop, query?: GetReviewOfSellerQueryDto) => {
      const start = dayjs()
      const { id } = shop
      const { limit = 10, page = 1 } = query

      const [
        reviews,
        inquiryReviewsOfSellerByShopIdError,
      ] = inquiryReviewsOfSellerByShopId(id, query)

      if (inquiryReviewsOfSellerByShopIdError != '') {
        response(
          undefined,
          UnableInquiryInquiryReviewsByShopId,
          inquiryReviewsOfSellerByShopIdError,
        )
      }

      let result
      try {
        result = await paginate<Review>(reviews, { limit, page })
      } catch (error) {
        return response(
          undefined,
          UnableInquiryInquiryReviewsByShopId,
          error.message,
        )
      }

      this.logger.info(
        `Done paginate InquiryReviewsOfSellerByShopIdFunc ${dayjs().diff(
          start,
        )} ms`,
      )

      this.logger.info(
        `Done GetReviewsOfSellerByShopIdHandler ${dayjs().diff(start)} ms`,
      )
      return response(result)
    }
  }

  InquiryReviewsOfSellerByShopIdFunc(
    etm: EntityManager,
  ): InquiryReviewsOfSellerByShopIdType {
    return (
      shopId: string,
      params: InquiryReviewsOfSellerParams,
    ): [SelectQueryBuilder<Review>, string] => {
      const start = dayjs()
      const { startDate, endDate, productName, isReply, star } = params

      let reviews: SelectQueryBuilder<Review>
      try {
        reviews = etm
          .createQueryBuilder(Review, 'reviews')
          .innerJoinAndMapOne(
            'reviews.reviewer',
            'reviews.reviewer',
            'reviewers',
          )
          .innerJoinAndMapOne(
            'reviews.productProfile',
            'reviews.productProfile',
            'productProfiles',
          )
          .where('reviews.deletedAt IS NULL')
          .andWhere('reviews.shopId = :shopId', { shopId })
          .orderBy('reviews.createdAt', 'DESC')

        if (startDate) {
          reviews.andWhere('reviews.createdAt >= :startDate', {
            startDate: dayjs(startDate).startOf('day'),
          })
        }

        if (endDate) {
          reviews.andWhere('reviews.createdAt <= :endDate ', {
            endDate: dayjs(startDate).endOf('day'),
          })
        }

        if (productName) {
          reviews.andWhere('productProfiles.name ILIKE :queryProductName', {
            queryProductName: '%' + productName + '%',
          })
        }

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
        `Done InquiryReviewsOfSellerByShopIdFunc ${dayjs().diff(start)} ms`,
      )

      return [reviews, '']
    }
  }

  GetReviewsByReviewIdHandler(
    inquiryReviewsByReviewId: InquiryReviewsByReviewIdType,
  ) {
    return async (reviewId: string) => {
      const start = dayjs()
      const [
        review,
        inquiryReviewsByReviewIdError,
      ] = await inquiryReviewsByReviewId(reviewId)

      if (inquiryReviewsByReviewIdError != '') {
        return response(
          undefined,
          UnableInquiryReviewsByReviewId,
          inquiryReviewsByReviewIdError,
        )
      }

      this.logger.info(
        `Done GetReviewsByReviewIdHandler ${dayjs().diff(start)} ms`,
      )
      return response(review)
    }
  }

  InquiryReviewsByReviewIdFunc(
    etm: EntityManager,
  ): InquiryReviewsByReviewIdType {
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

  ReplyReviewByReviewIdHandler(
    InquiryReviewsByReviewId: InquiryReviewsByReviewIdType,
    replyReviewByReviewId: ReplyReviewByReviewIdType,
  ) {
    return async (reviewId: string, body: ReplyCommentRequestDto) => {
      const start = dayjs()
      const [, inquiryReviewsByReviewIdError] = await InquiryReviewsByReviewId(
        reviewId,
      )

      if (inquiryReviewsByReviewIdError != '') {
        return response(
          undefined,
          UnableInquiryReviewsByReviewId,
          inquiryReviewsByReviewIdError,
        )
      }

      const replyReviewByReviewIdError = await replyReviewByReviewId(
        reviewId,
        body,
      )

      if (replyReviewByReviewIdError != '') {
        return response(
          undefined,
          UnableReplyReviewByReviewId,
          replyReviewByReviewIdError,
        )
      }

      this.logger.info(
        `Done ReplyReviewByReviewIdHandler ${dayjs().diff(start)} ms`,
      )
      return response(undefined)
    }
  }

  ReplyReviewByReviewIdToDbFunc(etm: EntityManager): ReplyReviewByReviewIdType {
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
        `Done ReplyReviewByReviewIdToDbFunc ${dayjs().diff(start)} ms`,
      )
      return ''
    }
  }

  GetReviewsByProductProfileIdHandler(
    inquiryReviewsByProductProfileId: InquiryReviewsByProductProfileIdType,
  ) {
    return async (productProfileId: string, body?: GetReviewQueryDto) => {
      const start = dayjs()
      const { limit = 10, page = 1 } = body

      const [
        reviews,
        inquiryReviewsByProductProfileIdError,
      ] = inquiryReviewsByProductProfileId(productProfileId, body)

      if (inquiryReviewsByProductProfileIdError != '') {
        response(
          undefined,
          UnableInquiryInquiryReviewsByProductProfileId,
          inquiryReviewsByProductProfileIdError,
        )
      }

      let result
      try {
        result = await paginate<Review>(reviews, { limit, page })
      } catch (error) {
        return response(
          undefined,
          UnableInquiryInquiryReviewsByShopId,
          error.message,
        )
      }

      this.logger.info(
        `Done paginate InquiryReviewsByProductProfileIdFunc ${dayjs().diff(
          start,
        )} ms`,
      )

      this.logger.info(
        `Done GetReviewsByProductProfileIdHandler ${dayjs().diff(start)} ms`,
      )
      return response(result)
    }
  }

  InquiryReviewsByProductProfileIdFunc(
    etm: EntityManager,
  ): InquiryReviewsByProductProfileIdType {
    return (
      productProfileId: string,
      params: InquiryReviewsParams,
    ): [SelectQueryBuilder<Review>, string] => {
      const start = dayjs()
      const { star } = params

      let reviews: SelectQueryBuilder<Review>
      try {
        reviews = etm
          .createQueryBuilder(Review, 'reviews')
          .innerJoinAndMapOne(
            'reviews.reviewer',
            'reviews.reviewer',
            'reviewers',
          )
          .where('reviews.deletedAt IS NULL')
          .andWhere('reviews.productProfileId = :productProfileId', {
            productProfileId,
          })
          .orderBy('reviews.createdAt', 'DESC')

        if (star) {
          reviews.andWhere('reviews.star = :star', { star })
        }
      } catch (error) {
        return [reviews, error.message]
      }

      this.logger.info(
        `Done InquiryReviewsByProductProfileIdFunc ${dayjs().diff(start)} ms`,
      )

      return [reviews, '']
    }
  }
}
