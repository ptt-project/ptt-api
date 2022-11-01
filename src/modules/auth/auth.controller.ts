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
import { Request } from 'express'
import { WalletService } from '../wallet/service/wallet.service'
import { HappyPointService } from '../happy-point/service/happy-point.service'
import { ShopService } from '../shop/service/shop.service'

@Controller('v1/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly otpService: OtpService,
    private readonly loginService: LoginService,
    private readonly mobileService: MobileService,
    private readonly walletService: WalletService,
    private readonly shopService: ShopService,
    private readonly happyPointService: HappyPointService,
  ) {}

  @Post('register')
  @Transaction()
  async register(
    @Req() request: Request,
    @Body() body: RegisterRequestDto,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.authService.RegisterHandler(
      this.otpService.InquiryVerifyOtpFunc(etm),
      this.authService.InquiryMemberExistFunc(etm),
      this.authService.ValidateInviteTokenFunc(etm),
      this.authService.InsertMemberToDbFunc(etm),
      this.mobileService.AddMobileFunc(etm),
      this.walletService.InsertWalletToDbFunc(etm),
      this.happyPointService.InsertHappyPointToDbFunc(etm),
    )(body, request.cookies)
  }

  @Post('register/validate')
  @Transaction()
  async validate(
    @Body() body: ValidateRegisterRequestDto,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.authService.ValidateRegisterHandler(
      this.authService.InquiryMemberExistFunc(etm),
    )(body)
  }

  @Post('login')
  @Transaction()
  async login(
    @Req() request,
    @Body() body: LoginRequestDto,
    @TransactionManager() etm: EntityManager,
  ) {
    const longinResponse = await this.loginService.LoginHandler(
      this.loginService.InquiryUserExistByUsernameFunc(etm),
      this.shopService.InquiryShopByMemberIdFunc(etm),
      this.loginService.ValidatePasswordFunc(),
      this.authService.GenAccessTokenFunc(),
      this.authService.GenRefreshTokenFunc(),
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
