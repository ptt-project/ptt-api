import { Controller } from '@nestjs/common'
import { PromotionService } from './promotion.service'

@Controller('v1/promotions')
export class PromotionController {
  constructor(private readonly promotionService: PromotionService) {}
}
