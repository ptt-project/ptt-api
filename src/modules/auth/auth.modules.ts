import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { OtpModule } from '../otp/otp.modules'
import { OtpService } from '../otp/service/otp.service'
import { jwtConstants } from './auth.constants'
import { AuthController } from './auth.controller'
import { AuthService } from './service/auth.service'
import { LoginService } from './service/login.service'
import { JwtStrategy } from './jwt.strategy'
import { MobileService } from '../mobile/service/mobile.service'
import { WalletService } from '../wallet/service/wallet.service'
import { ShopService } from '../seller/service/shop.service'

@Module({
  imports: [
    OtpModule,
    JwtModule.register({
      secret: jwtConstants.secret,
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LoginService,
    OtpService,
    JwtStrategy,
    MobileService,
    WalletService,
    ShopService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
