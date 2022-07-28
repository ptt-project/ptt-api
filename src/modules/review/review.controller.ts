import { Body, Controller, Get, Param, Put, Query } from '@nestjs/common'
import { query } from 'express'
import { Member } from 'src/db/entities/Member'
import { EntityManager, Transaction, TransactionManager } from 'typeorm'
import { Auth, ReqUser } from '../auth/auth.decorator'
import { getReviewQueryDTO, replyCommentRequestDto } from './dto/review.dto'
import { ReviewService } from './review.service'

@Auth()
@Controller('v1/sellers')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get('reviews')
  @Transaction()
  async getReviewsBySellerId(
    @ReqUser() member: Member,
    @Query() query: getReviewQueryDTO,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.reviewService.getReviewsBySellerIdHandler(
      this.reviewService.InquiryReviewsBySellerIdFunc(etm),
    )(member, query)
  }

  @Get('reviews/:reviewId')
  @Transaction()
  async getReviewsByReviewId(
    @Param('reviewId') reviewId: number,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.reviewService.getReviewsByReviewIdHandler(
      this.reviewService.InquiryReviewsByReviewIdFunc(etm),
    )(reviewId)
  }

  @Put('reviews/:reviewId/reply')
  @Transaction()
  async replyReviewByReviewId(
    @Param('reviewId') reviewId: number,
    @Body() body: replyCommentRequestDto,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.reviewService.replyReviewByReviewIdHandler(
      this.reviewService.InquiryReviewsByReviewIdFunc(etm),
      this.reviewService.replyReviewByReviewIdToDbFunc(etm),
    )(reviewId, body)
  }
}
