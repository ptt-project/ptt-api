import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { jwtConstants } from '../auth/auth.constants'

import { RelationService } from './service/relation.service'
import { EmailService } from './service/email.service'

import { MemberController } from './member.controller'
import { MemberService } from './service/member.service'
import { PasswordService } from './service/password.service'
import { ProductService } from './service/product.service'

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
    RelationService,
    ProductService,
  ],
  exports: [],
})
export class MemberModule {}
