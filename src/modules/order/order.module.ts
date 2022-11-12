import { Module } from '@nestjs/common'
import { RedisService } from 'nestjs-redis'
import { HappyPointService } from '../happy-point/service/happy-point.service'
import { LookupService } from '../happy-point/service/lookup.service'
import { OtpService } from '../otp/service/otp.service'
import { WalletService } from '../wallet/service/wallet.service'
import { OrderController } from './order.controller'
import { OrderService } from './service/order.service'

@Module({
  controllers: [OrderController],
  providers: [ OrderService, LookupService, HappyPointService, OtpService, WalletService],
  exports: [],
})
export class OrderModule {}
