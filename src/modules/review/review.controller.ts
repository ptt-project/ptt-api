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
  async getCommentsByMemberId(
    @ReqUser() member: Member,
    @Query() query: getReviewQueryDTO,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.reviewService.getCommentsByMemberIdHandler(
      this.reviewService.InquiryCommentsByMemberIdFunc(etm),
    )(member, query)
  }

  @Get('reviews/:reviewId')
  @Transaction()
  async getComments(
    @Param('reviewId') commentId: number,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.reviewService.getCommentsHandler(
      this.reviewService.InquiryCommentsByIdFunc(etm),
    )(commentId)
  }

  @Put('reviews/:reviewId/reply')
  @Transaction()
  async replyCommentById(
    @Param('reviewId') commentId: number,
    @Body() body: replyCommentRequestDto,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.reviewService.replyCommentByIdHandler(
      this.reviewService.InquiryCommentsByIdFunc(etm),
      this.reviewService.replyCommentByIdToDbFunc(etm),
    )(commentId, body)
  }
}
