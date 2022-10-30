import { Module } from '@nestjs/common'
import { OtpService } from '../otp/service/otp.service'
import { MobileController } from './mobile.controller'
import { MobileService } from './service/mobile.service'

@Module({
  controllers: [MobileController],
  providers: [MobileService, OtpService],
  exports: [MobileService],
})
export class MobileModule {}
