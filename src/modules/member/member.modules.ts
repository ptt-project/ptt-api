import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { jwtConstants } from '../auth/auth.constants'
import { EmailService } from './email.service'

import { MemberController } from './member.controller'
import { MemberService } from './member.service'
import { PasswordService } from './password.service'

@Module({
  imports: [
    JwtModule.register({
      secret: jwtConstants.secret,
    }),
  ],
  controllers: [MemberController],
  providers: [
    PasswordService,
    MemberService,
    EmailService,
  ],
  exports: [],
})
export class MemberModule {}
