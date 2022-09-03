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
import { WalletService } from '../wallet/wallet.service'
import { ShopService } from '../seller/shop.service'

@Controller('v1/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly otpService: OtpService,
    private readonly loginService: LoginService,
    private readonly mobileService: MobileService,
    private readonly walletService: WalletService,
    private readonly shopService: ShopService,
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
      this.walletService.InsertWalletToDbFunc(etm),
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
