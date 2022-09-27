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
import { ShopService } from '../seller/shop.service'
import { PasswordService } from '../member/password.service'
import { ForgotPasswordRequestDto } from '../member/dto/forgotPasswordEmail.dto'
import { ResetPasswordEmailRequestDto } from '../member/dto/resetPasswordEmail.dto'
import { ResetPasswordMobileRequestDto } from '../member/dto/resetPasswordMobile.dto'

@Controller('v1/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly otpService: OtpService,
    private readonly loginService: LoginService,
    private readonly mobileService: MobileService,
    private readonly shopService: ShopService,
    private readonly passwordService: PasswordService,
  ) {}

  @Post('register')
  @Transaction()
  async register(
    @Body() body: RegisterRequestDto,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.authService.registerHandler(
      this.otpService.inquiryVerifyOtpFunc(etm),
      this.authService.inquiryMemberExistFunc(etm),
      this.authService.insertMemberToDbFunc(etm),
      this.mobileService.addMobileFunc(etm),
    )(body)
  }

  @Post('forgot-password')
  @Transaction()
  async forgotPassword(
    @Body() body: ForgotPasswordRequestDto,
    @TransactionManager() etm: EntityManager,
  ) {
    return this.passwordService.ForgotPasswordHandler(
      this.passwordService.InquiryMemberExistByEmailFunc(etm),
      this.passwordService.UpdateLoginTokenToMemberFunc(),
      this.authService.genAccessTokenFunc(),
    )(body)
  }

  @Post('reset-password/email')
  @Transaction()
  async resetPasswordEmail(
    @Body() body: ResetPasswordEmailRequestDto,
    @TransactionManager() etm: EntityManager,
  ) {
    return this.passwordService.ResetPasswordEmailHandler(
      this.passwordService.InquiryMemberExistByLoginTokenAndEmailFunc(etm),
      this.passwordService.UpdateLoginTokenToMemberFunc(),
      this.passwordService.updatePasswordToMemberFunc(),
    )(body)
  }

  @Post('reset-password/mobile')
  @Transaction()
  async resetPasswordMobile(
    @Body() body: ResetPasswordMobileRequestDto,
    @TransactionManager() etm: EntityManager,
  ) {
    return this.passwordService.ResetPasswordMobileHandler(
      this.passwordService.InquiryMemberExistByMobileFunc(etm),
      this.otpService.inquiryVerifyOtpFunc(etm),
      this.passwordService.updatePasswordToMemberFunc(),
    )(body)
  }

  @Post('register/validate')
  @Transaction()
  async validate(
    @Body() body: ValidateRegisterRequestDto,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.authService.validateRegisterHandler(
      this.authService.inquiryMemberExistFunc(etm),
    )(body)
  }

  @Post('login')
  @Transaction()
  async login(
    @Req() request,
    @Body() body: LoginRequestDto,
    @TransactionManager() etm: EntityManager,
  ) {
    const longinResponse = await this.loginService.loginHandler(
      this.loginService.inquiryUserExistByUsernameFunc(etm),
      this.shopService.InquiryShopByMemberIdFunc(etm),
      this.loginService.validatePasswordFunc(),
      this.authService.genAccessTokenFunc(),
      this.authService.genRefreshTokenFunc(),
    )(body)

    const accessToken = `AccessToken=${
      longinResponse.data.accessToken
    }; Path=/; Max-Age=${dayjs().add(1, 'day')};`

    const refreshToken = `RefreshToken=${
      longinResponse.data.refreshToken
    }; Path=/; Max-Age=${dayjs().add(7, 'day')};`

    request.res.setHeader('Set-Cookie', [accessToken, refreshToken])

    return longinResponse
  }
}
