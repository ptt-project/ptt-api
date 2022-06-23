import { Body, Controller, Get, Post, Param } from '@nestjs/common'
import { AuthService } from './auth.service'
import {OtpService} from '../otp/otp.service'

@Controller('v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('hello-world')
  async HelloWorld() {
    return this.authService.helloWorld()
  }

  @Post('request-otp')
  async requestOtp(@Body() body) {
    return await this.authService.requestOtp(body);
  }

  @Post('register')
  async register(@Body() body) {
    return await this.authService.register(
      this.authService.verifyOtp(),
      this.authService.validateMember(),
      this.authService.createMember(),
    )(body);
  }

  @Post('register/validate')
  async validate(@Body() body) {
    return await this.authService.validate(
      this.authService.validateMember(),
    )(body);
  }
}
