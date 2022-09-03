import { Module } from '@nestjs/common'
import { ExchangeRateContoller } from './exchange-rate.controller'
import { ExchangeRateService } from './exchange-rate.service'

@Module({
  controllers: [ExchangeRateContoller],
  providers: [ExchangeRateService],
  exports: [ExchangeRateService],
})
export class ExchangeRateModule {}
