import { Injectable } from '@nestjs/common'
import { PinoLogger } from 'nestjs-pino'
import { InquiryCurrentExchangeRateFromDbType } from './exchange-rate.type'

@Injectable()
export class ExchangeRateService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(ExchangeRateService.name)
  }

  async InquiryCurrentExchangeRateFromDbFunc(): Promise<
    InquiryCurrentExchangeRateFromDbType
  > {
    return async () => {
      return 1
    }
  }
}
