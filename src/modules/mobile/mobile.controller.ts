import { Body, Controller, Delete, Patch, Post } from '@nestjs/common'
import { Member } from 'src/db/entities/Member'
import { EntityManager, Transaction, TransactionManager } from 'typeorm'
import { Auth, ReqUser } from '../auth/auth.decorator'
import { OtpService } from '../otp/otp.service'
import {
  addMobileRequestDto,
  setMainMobileRequestDto,
  deleteMobileRequestDto,
} from './dto/mobile.dto'
import { MobileService } from './mobile.service'

@Controller('v1/members/mobiles')
export class MobileController {
  constructor(
    private readonly mobileService: MobileService,
    private readonly otpService: OtpService,
  ) {}

  @Auth()
  @Post('add')
  @Transaction()
  async addMobile(
    @ReqUser() member: Member,
    @Body() body: addMobileRequestDto,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.mobileService.addMobileHandler(
      this.otpService.InquiryVerifyOtpFunc(etm),
      this.mobileService.AddMobileFunc(etm),
    )(member, body)
  }

  @Auth()
  @Patch('set-main')
  @Transaction()
  async setMainMobile(
    @ReqUser() member: Member,
    @Body() body: setMainMobileRequestDto,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.mobileService.setMainMobileHandler(
      this.otpService.InquiryVerifyOtpFunc(etm),
      this.mobileService.GetMobileFormDbByMobilePhoneFunc(etm),
      this.mobileService.SetMainMobileFunc(etm),
    )(member, body)
  }

  @Auth()
  @Delete('delete')
  @Transaction()
  async deleteMobile(
    @ReqUser() member: Member,
    @Body() body: deleteMobileRequestDto,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.mobileService.deleteMobileHandler(
      this.otpService.InquiryVerifyOtpFunc(etm),
      this.mobileService.GetMobileFormDbByMobilePhoneFunc(etm),
      this.mobileService.DeleteMobileFunc(etm),
    )(member, body)
  }
}
