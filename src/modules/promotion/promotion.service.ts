import { Injectable } from '@nestjs/common'
import { PinoLogger } from 'nestjs-pino'

@Injectable()
export class PromotionService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(PromotionService.name)
  }
}
