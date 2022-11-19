import { Injectable } from '@nestjs/common'
import { response } from 'src/utils/response'
import { Review } from 'src/db/entities/Review'
import {
  UnableInquiryReviewsByReviewId,
  UnableInquiryInquiryReviewsByShopId,
  UnableReplyReviewByReviewId,
} from 'src/utils/response-code'
import { EntityManager, SelectQueryBuilder } from 'typeorm'
import {
  InquiryReviewsByReviewIdType,
  InquiryReviewsByShopIdType,
  InquiryReviewsWithSellerByShopIdType,
  InquiryReviewsWithSellerParams,
  ReplyReviewByReviewIdType,
  ReplyReviewToDbParams,
} from '../type/review.type'
import {
  GetReviewQueryDto,
  GetReviewWithSellerQueryDto,
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

  GetReviewsWithSellerByShopIdHandler(
    inquiryReviewsWithSellerByShopId: InquiryReviewsWithSellerByShopIdType,
  ) {
    return async (shop: Shop, query?: GetReviewWithSellerQueryDto) => {
      const start = dayjs()
      const { id } = shop
      const { limit = 10, page = 1 } = query

      const [
        reviews,
        inquiryReviewsWithSellerByShopIdError,
      ] = inquiryReviewsWithSellerByShopId(id, query)

      if (inquiryReviewsWithSellerByShopIdError != '') {
        response(
          undefined,
          UnableInquiryInquiryReviewsByShopId,
          inquiryReviewsWithSellerByShopIdError,
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
        `Done paginate InquiryReviewsByShopIdFunc ${dayjs().diff(start)} ms`,
      )

      this.logger.info(
        `Done GetReviewsWithSellerByShopIdHandler ${dayjs().diff(start)} ms`,
      )
      return response(result)
    }
  }

  InquiryReviewsWithSellerByShopIdFunc(
    etm: EntityManager,
  ): InquiryReviewsWithSellerByShopIdType {
    return (
      shopId: string,
      params: InquiryReviewsWithSellerParams,
    ): [SelectQueryBuilder<Review>, string] => {
      const start = dayjs()
      const { startDate, endDate, productName, isReply, star } = params

      let reviews: SelectQueryBuilder<Review>
      try {
        reviews = etm
          .createQueryBuilder(Review, 'reviews')
          .innerJoin('reviews.productProfile', 'productProfiles')
          .where('reviews.deletedAt IS NULL')
          .andWhere('reviews.shopId = :shopId', { shopId })

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
        `Done InquiryReviewsByShopIdFunc ${dayjs().diff(start)} ms`,
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

  GetReviewsByShopIdHandler(
    InquiryReviewsByShopId: InquiryReviewsByShopIdType,
  ) {
    return async (shopId: string, body?: GetReviewQueryDto) => {
      const start = dayjs()
      const { limit = 10, page = 1 } = body

      const [reviews, inquiryReviewsByShopIdError] = InquiryReviewsByShopId(
        shopId,
      )

      if (inquiryReviewsByShopIdError != '') {
        response(
          undefined,
          UnableInquiryInquiryReviewsByShopId,
          inquiryReviewsByShopIdError,
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
        `Done paginate InquiryReviewsByShopIdFunc ${dayjs().diff(start)} ms`,
      )

      this.logger.info(
        `Done GetReviewsByShopIdHandler ${dayjs().diff(start)} ms`,
      )
      return response(result)
    }
  }

  InquiryReviewsByShopIdFunc(etm: EntityManager): InquiryReviewsByShopIdType {
    return (shopId: string): [SelectQueryBuilder<Review>, string] => {
      const start = dayjs()

      let reviews: SelectQueryBuilder<Review>
      try {
        reviews = etm
          .createQueryBuilder(Review, 'reviews')
          .innerJoin('reviews.productProfile', 'productProfiles')
          .where('reviews.deletedAt IS NULL')
          .andWhere('reviews.shopId = :shopId', { shopId })
      } catch (error) {
        return [reviews, error.message]
      }

      this.logger.info(
        `Done InquiryReviewsByShopIdFunc ${dayjs().diff(start)} ms`,
      )

      return [reviews, '']
    }
  }
}
