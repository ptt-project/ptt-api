import { Module } from '@nestjs/common'
import {
  ReviewController,
  ReviewWithSellerController,
} from './review.controller'
import { ReviewService } from './service/review.service'

@Module({
  controllers: [ReviewWithSellerController, ReviewController],
  providers: [ReviewService],
  exports: [ReviewService],
})
export class ReviewModule {}
