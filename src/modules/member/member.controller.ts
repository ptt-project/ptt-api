import { Body, Controller, Patch } from '@nestjs/common'
import { ChagnePasswordRequestDto } from './dto/changePassword.dto'
import { MemberService } from './member.service'

@Controller('v1/members')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Patch('change-password')
  async changePassword(@Body() body: ChagnePasswordRequestDto) {
    return await this.memberService.changePasswordHandler(
      this.memberService.inquiryMemberByIdFunc(),
      this.memberService.updatePasswordToMemberFunc(),
    )(body)
  }
}
