import { Module } from '@nestjs/common'
import { OtpModule } from '../otp/otp.modules'
import { OtpService } from '../otp/otp.service'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
  imports: [OtpModule]
})
export class AuthModule {}
