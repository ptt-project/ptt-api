import { Module } from '@nestjs/common'
import { EmailContoller } from './email.controller'
import { EmailService } from './email.service'

@Module({
  controllers: [EmailContoller],
  providers: [EmailService],
  exports: [],
})
export class EmailModule {}
