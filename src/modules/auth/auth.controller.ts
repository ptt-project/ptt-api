import { Body, Controller, Get, Post, Req } from '@nestjs/common'
import { AuthService } from './auth.service'
import { RegisterRequestDto } from './dto/register.dto'
import { LoginService } from './login.service'
import { LoginRequestDto } from './dto/login.dto'
import { Auth, ReqUser } from './auth.decorator'
import dayjs from 'dayjs'
import { Member } from 'src/db/entities/Member'

@Controller('v1/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly loginService: LoginService,
  ) {}

  @Auth()
  @Get('getme')
  async getMes(@ReqUser() member: Member) {
    return this.authService.getMe(member)
  }

  @Post('request-otp')
  async requestOtp(@Body() body) {
    return await this.authService.requestOtp(body)
  }

  @Post('register')
  async register(@Body() body: RegisterRequestDto) {
    return await this.authService.registerHandler(
      this.authService.verifyOtp(),
      this.authService.inquiryMemberEixstFunc(),
      this.authService.insertMemberToDbFunc(),
    )(body)
  }

  @Post('register/validate')
  async validate(@Body() body) {
    return await this.authService.validate(
      this.authService.inquiryMemberEixstFunc(),
    )(body)
  }

  @Post('login')
  async login(@Req() request, @Body() body: LoginRequestDto) {
    const longinResponse = await this.loginService.loginHandler(
      this.loginService.inquiryUserExistByUsernameFunc(),
      this.loginService.validatePasswordFunc(),
      this.authService.genAccessTokenFunc(),
    )(body)

    const accessToken = `AccessToken=${
      longinResponse.data.accessToken
    }; HttpOnly; Path=/; Max-Age=${dayjs().add(10, 'second')}`

    const RefreshToken = `RefreshToken=${
      longinResponse.data.accessToken
    }; HttpOnly; Path=/; Max-Age=${dayjs().add(10, 'second')}`

    request.res.setHeader('Set-Cookie', [accessToken, RefreshToken])
    return longinResponse
  }
}
