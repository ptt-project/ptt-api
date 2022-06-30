import { Body, Controller, Get, Patch } from '@nestjs/common'
import { Member } from 'src/db/entities/Member'
import { Auth, ReqUser } from '../auth/auth.decorator'
import { AuthService } from '../auth/auth.service'
import { ChagnePasswordRequestDto } from './dto/changePassword.dto'
import { MemberService } from './member.service'
import { PasswordService } from './password.service'

@Controller('v1/members')
export class MemberController {
  constructor(
    private readonly passwordService: PasswordService,
    private readonly memberService: MemberService,
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
}
