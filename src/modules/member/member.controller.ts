import { Body, Controller, Patch } from '@nestjs/common'
import { Member } from 'src/db/entities/Member'
import { Auth, ReqUser } from '../auth/auth.decorator'
import { ChagnePasswordRequestDto } from './dto/changePassword.dto'
import { PasswordService } from './password.service'

@Controller('v1/members')
export class MemberController {
  constructor(private readonly passwordService: PasswordService) {}

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
}
