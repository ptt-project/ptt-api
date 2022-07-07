import { HttpStatus, Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { jwtConstants } from './auth.constants'
import { AuthService, TokenType } from './auth.service'
import { Request } from 'express'
import dayjs, { Dayjs } from 'dayjs'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.AccessToken
        },
      ]),
      secretOrKey: jwtConstants.secret,
      passReqToCallback: true,
    })
  }

  async validate(request: Request, payload: TokenType): Promise<any> {
    const [response, isError] = await (
      await this.authService.validateTokenHandler(
        this.authService.exiredTokenFunc(),
        this.authService.inquiryUserExistByIdFunc(),
        this.authService.genAccessTokenFunc(),
        this.authService.genRefreshTokenFunc(),
      )
    )(request?.cookies?.AccessToken, request?.cookies?.RefreshToken, payload.id)

    if (isError) {
      return false
    } else {
      const accessToken = `AccessToken=${
        response.accessToken
      }; HttpOnly; Path=/; Max-Age=${dayjs().add(10, 'second')}`

      const refreshToken = `RefreshToken=${
        response.refreshToken
      }; HttpOnly; Path=/; Max-Age=${dayjs().add(20, 'second')}`
      request.res.setHeader('Set-Cookie', [accessToken, refreshToken])
    }

    return response.member
  }
}
