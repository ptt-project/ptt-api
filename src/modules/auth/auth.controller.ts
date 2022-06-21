import { Body, Controller, Get, Post } from '@nestjs/common'
import { AuthService } from './auth.service'

@Controller('v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('hello-world')
  async HelloWorld() {
    return this.authService.helloWorld()
  }
}
