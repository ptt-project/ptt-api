import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { jwtConstants } from './auth.constants'
import { AuthService } from './auth.service'
import { TokenType } from './auth.type'
import { Request } from 'express'
import dayjs from 'dayjs'
import { PinoLogger } from 'nestjs-pino'
import { Connection, EntityManager, getConnection } from 'typeorm'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: PinoLogger,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.AccessToken
        },
      ]),
      secretOrKey: jwtConstants.secret,
      passReqToCallback: true,
    })
    this.logger.setContext(JwtStrategy.name)
  }

  async validate(request: Request, payload: TokenType): Promise<any> {
    const start = dayjs()
    const connection: Connection = getConnection()
    const etm: EntityManager = connection.createEntityManager()
    const [response, isError] = await (
      await this.authService.validateTokenHandler(
        this.authService.exiredTokenFunc(),
        this.authService.inquiryUserExistByIdFunc(etm),
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

      // request.res.setHeader('Set-Cookie', [accessToken, refreshToken])
      request.res.setHeader('AccessToken', accessToken)
      request.res.setHeader('RefreshToken', refreshToken)
    }

    this.logger.info(`Done ValidateToken ${dayjs().diff(start)} ms`)
    return response.member
  }
}
