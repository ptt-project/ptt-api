import { Body, Controller, Delete, Get, Patch, Post } from '@nestjs/common'
import { Member } from 'src/db/entities/Member'
import { EntityManager, Transaction, TransactionManager } from 'typeorm'
import { Auth, ReqUser } from '../auth/auth.decorator'
import { OtpService } from '../otp/otp.service'
import { addMobileRequestDto, setMainMobileRequestDto, deleteMobileRequestDto } from './dto/mobile.dto'
import { MobileService } from './mobile.service'

@Controller('v1/mobile')
export class MobileController {
  constructor(
    private readonly mobileService: MobileService,
    private readonly otpService: OtpService
  ) {}

  @Auth()
  @Post('add')
  @Transaction({isolation: "SERIALIZABLE"})
  async addMobile(
    @ReqUser() member: Member,@Body() body: addMobileRequestDto, @TransactionManager() manager: EntityManager) {
    return await this.mobileService.addMobileHandler(
      this.otpService.inquiryVerifyOtpFunc(),
      this.mobileService.addMobileFunc(),
    )(member, body, manager)
  }

  @Auth()
  @Patch('set-main')
  @Transaction({isolation: "SERIALIZABLE"})
  async setMainMobile(@ReqUser() member: Member, @Body() body: setMainMobileRequestDto, @TransactionManager() manager: EntityManager) {
    return await this.mobileService.setMainMobileHandler(
      this.otpService.inquiryVerifyOtpFunc(),
      this.mobileService.setMainMobileFunc(),
    )(member, body, manager)
  }

  @Auth()
  @Delete('delete')
  @Transaction({isolation: "SERIALIZABLE"})
  async deleteMobile(@ReqUser() member: Member, @Body() body: deleteMobileRequestDto, @TransactionManager() manager: EntityManager) {
    return await this.mobileService.deleteMobileHandler(
      this.otpService.inquiryVerifyOtpFunc(),
      this.mobileService.deleteMobileFunc(),
    )(member, body, manager)
  }
}
