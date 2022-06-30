import { Module } from '@nestjs/common'
import { OtpService } from '../otp/otp.service'
import { MobileController } from './mobile.controller'
import { MobileService } from './mobile.service'

@Module({
  controllers: [MobileController],
  providers: [MobileService, OtpService],
  exports: [MobileService],
})
export class MobileModule {}
