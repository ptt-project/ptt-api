import { Body, Controller, Get, Post } from '@nestjs/common'
import { sendOtpRequestDto, verifyOtpRequestDto } from './dto/otp.dto';
import { OtpService } from './otp.service'

@Controller('v1/otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post('request-otp')
  async requestOtp(@Body() body: sendOtpRequestDto) {
    return await this.otpService.requestOtp({...body, type: 'test-otp'})
  }

  @Post('verify-otp')
  async verifyOtp(@Body() body: verifyOtpRequestDto) {
    await this.otpService.verifyOtp(body)
    return 
  }
}
