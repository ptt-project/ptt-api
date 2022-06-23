import { Body, Controller, Get, Post } from '@nestjs/common'
import { OtpService } from './otp.service'

@Controller('v1/otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post('request-otp')
  async requestOtp(@Body() body) {
    return await this.otpService.requestOtp(body);
  }
}
