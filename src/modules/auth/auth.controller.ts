import { Body, Controller, Post, Req } from '@nestjs/common'
import { AuthService } from './auth.service'
import {
  RegisterRequestDto,
  ValidateRegisterRequestDto,
} from './dto/register.dto'
import { LoginService } from './login.service'
import { LoginRequestDto } from './dto/login.dto'
import { OtpService } from '../otp/otp.service'
import { EntityManager, Transaction, TransactionManager } from 'typeorm'
import { MobileService } from '../mobile/mobile.service'
import dayjs from 'dayjs'

@Controller('v1/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly otpService: OtpService,
    private readonly loginService: LoginService,
    private readonly mobileService: MobileService,
  ) {}

  @Post('register')
  @Transaction()
  async register(
    @Body() body: RegisterRequestDto,
    @TransactionManager() manager: EntityManager,
  ) {
    return await this.authService.registerHandler(
      this.otpService.inquiryVerifyOtpFunc(),
      this.authService.inquiryMemberExistFunc(),
      this.authService.insertMemberToDbFunc(),
      this.mobileService.addMobileFunc(),
    )(body, manager)
  }

  @Post('register/validate')
  async validate(@Body() body: ValidateRegisterRequestDto) {
    return await this.authService.validateRegisterHandler(
      this.authService.inquiryMemberExistFunc(),
    )(body)
  }

  @Post('login')
  async login(@Req() request, @Body() body: LoginRequestDto) {
    const longinResponse = await this.loginService.loginHandler(
      this.loginService.inquiryUserExistByUsernameFunc(),
      this.loginService.validatePasswordFunc(),
      this.authService.genAccessTokenFunc(),
      this.authService.genRefreshTokenFunc(),
    )(body)

    const accessToken = `AccessToken=${
      longinResponse.data.accessToken
    }; HttpOnly; Path=/; Max-Age=${dayjs().add(1, 'day')}`

    const refreshToken = `RefreshToken=${
      longinResponse.data.refreshToken
    }; HttpOnly; Path=/; Max-Age=${dayjs().add(7, 'day')}`

    request.res.setHeader('Set-Cookie', [accessToken, refreshToken])
    return longinResponse
  }
}
