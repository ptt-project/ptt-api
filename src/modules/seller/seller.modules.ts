import { Module } from '@nestjs/common'

import { SellerController } from './seller.controller'
import { RegisterService } from './register.service'

@Module({
  controllers: [SellerController],
  providers: [RegisterService],
  exports: [],
})
export class SellerModule {}
