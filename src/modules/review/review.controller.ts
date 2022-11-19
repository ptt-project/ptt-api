import { Body, Controller, Get, Param, Put, Query } from '@nestjs/common'
import { Shop } from 'src/db/entities/Shop'
import { EntityManager, Transaction, TransactionManager } from 'typeorm'
import { ReqShop, Seller } from '../auth/auth.decorator'
import {
  GetReviewQueryDto,
  GetReviewWithSellerQueryDto,
  ReplyCommentRequestDto,
} from './dto/review.dto'
import { ReviewService } from './service/review.service'

@Seller()
@Controller('v1/sellers')
export class ReviewWithSellerController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get('reviews')
  @Transaction()
  async getReviewsByShopId(
    @ReqShop() shop: Shop,
    @Query() query: GetReviewWithSellerQueryDto,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.reviewService.GetReviewsWithSellerByShopIdHandler(
      this.reviewService.InquiryReviewsWithSellerByShopIdFunc(etm),
    )(shop, query)
  }

  @Get('reviews/:reviewId')
  @Transaction()
  async getReviewsByReviewId(
    @Param('reviewId') reviewId: string,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.reviewService.GetReviewsByReviewIdHandler(
      this.reviewService.InquiryReviewsByReviewIdFunc(etm),
    )(reviewId)
  }

  @Put('reviews/:reviewId/reply')
  @Transaction()
  async replyReviewByReviewId(
    @Param('reviewId') reviewId: string,
    @Body() body: ReplyCommentRequestDto,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.reviewService.ReplyReviewByReviewIdHandler(
      this.reviewService.InquiryReviewsByReviewIdFunc(etm),
      this.reviewService.ReplyReviewByReviewIdToDbFunc(etm),
    )(reviewId, body)
  }
}

@Controller('v1/reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get('shop/:shopId')
  @Transaction()
  async getReviewsByShopId(
    @Param('shopId') shopId: string,
    @Query() query: GetReviewQueryDto,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.reviewService.GetReviewsByShopIdHandler(
      this.reviewService.InquiryReviewsByShopIdFunc(etm),
    )(shopId, query)
  }
}
