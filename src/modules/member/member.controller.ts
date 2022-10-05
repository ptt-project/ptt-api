import { Body, Controller, Get, Patch, Put } from '@nestjs/common'
import { Member } from 'src/db/entities/Member'
import { EntityManager, Transaction, TransactionManager } from 'typeorm'
import { Auth, ReqUser } from '../auth/auth.decorator'
import { ChagnePasswordRequestDto } from './dto/changePassword.dto'
import { EditEmailRequestDto } from './dto/editEmail.dto'
import { UpdateProfiledRequestDto } from './dto/updateProfile.dto'
import { EmailService } from './service/email.service'
import { MemberService } from './service/member.service'
import { PasswordService } from './service/password.service'

@Controller('v1/members')
export class MemberController {
  constructor(
    private readonly passwordService: PasswordService,
    private readonly memberService: MemberService,
    private readonly emailService: EmailService,
  ) {}

  @Auth()
  @Patch('change-password')
  async changePassword(
    @ReqUser() member: Member,
    @Body() body: ChagnePasswordRequestDto,
  ) {
    return await this.passwordService.changePasswordHandler(
      this.passwordService.vadlidateOldPasswordFunc(),
      this.passwordService.updatePasswordToMemberFunc(),
    )(member, body)
  }

  @Auth()
  @Get('profile')
  async getProfile(@ReqUser() member: Member) {
    return this.memberService.getProfileHandler(
      this.memberService.getProfileFunc(),
    )(member)
  }

  @Auth()
  @Patch('edit-email')
  @Transaction()
  async editEmail(
    @ReqUser() member: Member,
    @Body() body: EditEmailRequestDto,
    @TransactionManager() manager: EntityManager,
  ) {
    return await this.emailService.editEmailHandler(
      this.emailService.vadlidatePasswordFunc(),
      this.emailService.vadlidateEmailFunc(),
      this.emailService.updateEmailToMemberFunc(),
      this.emailService.notifyNewEmailFunc(),
    )(member, body, manager)
  }

  @Auth()
  @Put('profile')
  @Transaction()
  async updateProfile(
    @ReqUser() member: Member,
    @Body() body: UpdateProfiledRequestDto,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.memberService.updateProfileHandler(
      this.memberService.updateProfileToMemberFunc(etm),
      this.memberService.InquiryUserExistByMemberIdFunc(etm),
    )(member, body)
  }
}
