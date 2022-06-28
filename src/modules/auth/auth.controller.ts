import { Body, Controller, Get, Post, Param } from '@nestjs/common'
import { AuthService } from './auth.service'
import { OtpService } from '../otp/otp.service'
import { RegisterRequestDto } from './dto/register.dto'

@Controller('v1/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly otpService: OtpService,
  ) {}

  @Get('hello-world')
  async HelloWorld() {
    return this.authService.helloWorld()
  }

  @Post('register')
  async register(@Body() body: RegisterRequestDto) {
    return await this.authService.registerHandler(
      this.otpService.inquiryVerifyOtpFunc(),
      this.authService.inquiryMemberEixstFunc(),
      this.authService.insertMemberToDbFunc(),
    )(body)
  }

  @Post('register/validate')
  async validate(@Body() body) {
    return await this.authService.validateRegisterHandler(
      this.authService.inquiryMemberEixstFunc(),
    )(body)
  }
}
