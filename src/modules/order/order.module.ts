import { Module } from '@nestjs/common'
import { RedisService } from 'nestjs-redis'
import { HappyPointService } from '../happy-point/service/happy-point.service'
import { LookupService } from '../happy-point/service/lookup.service'
import { OtpService } from '../otp/service/otp.service'
import { PaymentModule } from '../payment/payment.module'
import { PaymentService } from '../payment/service/payment.service'
import { WalletService } from '../wallet/service/wallet.service'
import { OrderController } from './order.controller'
import { OrderService } from './service/order.service'
import { ProductService } from './service/product.service'
import { ShippopService } from './service/shippop.service'
import { ShopService } from './service/shop.service'

@Module({
  imports: [PaymentModule],
  controllers: [OrderController],
  providers: [
    OrderService,
    LookupService,
    HappyPointService,
    OtpService,
    WalletService,
    PaymentService,
    ProductService,
    ShopService,
    ShippopService,
  ],
  exports: [],
})
export class OrderModule {}
