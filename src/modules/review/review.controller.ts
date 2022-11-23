import { Body, Controller, Get, Param, Put, Query } from '@nestjs/common'
import { Shop } from 'src/db/entities/Shop'
import { EntityManager, Transaction, TransactionManager } from 'typeorm'
import { ReqShop, Seller } from '../auth/auth.decorator'
import {
  GetReviewQueryDto,
  GetReviewOfSellerQueryDto,
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
    @Query() query: GetReviewOfSellerQueryDto,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.reviewService.GetReviewsByShopIdHandler(
      this.reviewService.InquiryReviewsByShopIdFunc(etm),
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

  @Get('products-profile/:productProfileId')
  @Transaction()
  async getReviewsByProductProfileId(
    @Param('productProfileId') productProfileId: string,
    @Query() query: GetReviewQueryDto,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.reviewService.GetReviewsByProductProfileIdHandler(
      this.reviewService.InquiryReviewsByProductProfileIdFunc(etm),
    )(productProfileId, query)
  }
}
