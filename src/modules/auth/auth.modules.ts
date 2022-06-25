import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { OtpModule } from '../otp/otp.modules'
import { OtpService } from '../otp/otp.service'
import { jwtConstants } from './auth.constants'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { LoginService } from './login.service'
import { JwtStrategy } from './jwt.strategy'

@Module({
  imports: [
    OtpModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '86400s' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LoginService, OtpService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
