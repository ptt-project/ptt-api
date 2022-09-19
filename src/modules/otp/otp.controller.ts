import { Body, Controller, Get, Post } from '@nestjs/common'
import { EntityManager, Transaction, TransactionManager } from 'typeorm'
import { sendOtpRequestDto, verifyOtpRequestDto } from './dto/otp.dto'
import { OtpService } from './otp.service'

@Controller('v1/otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post('request')
  @Transaction()
  async requestOtp(
    @Body() body: sendOtpRequestDto,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.otpService.requestOtpHandler(
      this.otpService.verifyForSendOtp(etm),
      this.otpService.sendOtp(),
      this.otpService.saveOtpToDb(etm),
    )(body)
  }

  @Post('verify')
  @Transaction()
  async verifyOtp(
    @Body() body: verifyOtpRequestDto,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.otpService.verifyOtpHandler(
      this.otpService.InquiryVerifyOtpFunc(etm),
    )(body)
  }
}
