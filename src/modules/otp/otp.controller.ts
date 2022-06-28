import { Body, Controller, Get, Post } from '@nestjs/common'
import { sendOtpRequestDto, verifyOtpRequestDto } from './dto/otp.dto'
import { OtpService } from './otp.service'

@Controller('v1/otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post('request-otp')
  async requestOtp(@Body() body: sendOtpRequestDto) {
    return await this.otpService.requestOtpHandler(
      this.otpService.verifyForSendOtp(),
      this.otpService.sendOtp(),
      this.otpService.saveOtpToDb(),
    )(body)
  }

  @Post('verify-otp')
  async verifyOtp(@Body() body: verifyOtpRequestDto) {
    return await this.otpService.verifyOtpHandler(
      this.otpService.inquiryVerifyOtpFunc(),
    )(body)
  }
}
