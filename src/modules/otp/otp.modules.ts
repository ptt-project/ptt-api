import { Module } from '@nestjs/common'
import { OtpController } from './otp.controller'
import { OtpService } from './service/otp.service'

@Module({
  controllers: [OtpController],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}
