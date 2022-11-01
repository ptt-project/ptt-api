import { Module } from '@nestjs/common'

import { SellerController } from './seller.controller'
import { RegisterService } from './service/register.service'
@Module({
  controllers: [SellerController],
  providers: [RegisterService],
  exports: [RegisterService],
})
export class SellerModule {}
