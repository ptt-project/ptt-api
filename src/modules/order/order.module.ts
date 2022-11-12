import { Module } from '@nestjs/common'
import { OrderService } from './service/order.service'

@Module({
  controllers: [],
  providers: [OrderService],
  exports: [],
})
export class OrderModule {}
