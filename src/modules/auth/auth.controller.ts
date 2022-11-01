import { Body, Controller, Post, Req } from '@nestjs/common'
import { AuthService } from './service/auth.service'
import {
  RegisterRequestDto,
  ValidateRegisterRequestDto,
} from './dto/register.dto'
import { LoginService } from './service/login.service'
import { LoginRequestDto } from './dto/login.dto'
import { OtpService } from '../otp/service/otp.service'
import { EntityManager, Transaction, TransactionManager } from 'typeorm'
import { MobileService } from '../mobile/service/mobile.service'
import dayjs from 'dayjs'
import { WalletService } from '../wallet/service/wallet.service'
import { ShopService } from '../seller/service/shop.service'
import { HappyPointService } from '../happy-point/service/happy-point.service'
import { PasswordService } from '../member/service/password.service'
import { ForgotPasswordRequestDto, ResetPasswordEmailRequestDto, ResetPasswordMobileRequestDto } from '../member/dto/password.dto'

@Controller('v1/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly otpService: OtpService,
    private readonly loginService: LoginService,
    private readonly mobileService: MobileService,
    private readonly walletService: WalletService,
    private readonly shopService: ShopService,
    private readonly passwordService: PasswordService,
    private readonly happyPointService: HappyPointService,
  ) {}

  @Post('register')
  @Transaction()
  async register(
    @Body() body: RegisterRequestDto,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.authService.registerHandler(
      this.otpService.InquiryVerifyOtpFunc(etm),
      this.authService.inquiryMemberExistFunc(etm),
      this.authService.insertMemberToDbFunc(etm),
      this.mobileService.AddMobileFunc(etm),
      this.walletService.InsertWalletToDbFunc(etm),
      this.happyPointService.InsertHappyPointToDbFunc(etm),
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
      this.authService.genAccessTokenFunc(),
      this.passwordService.UpdateLoginTokenToMemberFunc(),
      this.passwordService.SendMessageToEmailFunc(),
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
      this.passwordService.UpdatePasswordToMemberFunc(),
    )(body)
  }

  @Post('reset-password/mobile')
  @Transaction()
  async resetPasswordMobile(
    @Body() body: ResetPasswordMobileRequestDto,
    @TransactionManager() etm: EntityManager,
  ) {
    return this.passwordService.ResetPasswordMobileHandler(
      this.otpService.InquiryVerifyOtpFunc(etm),
      this.passwordService.InquiryMemberExistByMobileFunc(etm),
      this.passwordService.UpdatePasswordToMemberFunc(),
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
    }; Path=/; Max-Age=${dayjs().add(1, 'day')}; HttpOnly; Domain=${
      process.env.SET_COOKIES_DOMAIN
    };`

    const refreshToken = `RefreshToken=${
      longinResponse.data.refreshToken
    }; Path=/; Max-Age=${dayjs().add(7, 'day')}; HttpOnly; Domain=${
      process.env.SET_COOKIES_DOMAIN
    };`

    request.res.setHeader('Set-Cookie', [accessToken, refreshToken])

    return longinResponse
  }
}
