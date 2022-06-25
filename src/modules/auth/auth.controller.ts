import { Body, Controller, Get, Post } from '@nestjs/common'
import { AuthService } from './auth.service'
import { RegisterRequestDto } from './dto/register.dto'
import { LoginService } from './login.service'
import { LoginRequestDto } from './dto/login.dto'
import { Auth } from './auth.decorator'

@Controller('v1/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly loginService: LoginService,
  ) {}

  @Get('hello-world')
  async HelloWorld() {
    return this.authService.helloWorld()
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
  async login(@Body() body: LoginRequestDto) {
    return await this.loginService.loginHandler(
      this.loginService.inquiryUserExistByUsernameFunc(),
      this.loginService.validatePasswordFunc(),
      this.loginService.genJwtFunc(),
    )(body)
  }
}
