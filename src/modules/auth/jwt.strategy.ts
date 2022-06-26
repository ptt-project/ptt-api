import { HttpStatus, Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { jwtConstants } from './auth.constants'
import { AuthService } from './auth.service'
import { TokenType } from './auth.service'
import { Request } from 'express'

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
    console.log('request?.cookies?.AccessToken', request?.cookies?.AccessToken)
    console.log(
      'request?.cookies?.RefreshToken',
      request?.cookies?.RefreshToken,
    )

    console.log('validate JwtStrategy')
    console.log('payload.id', payload.id)

    return { id: payload.id }

    // logic
    // isExiredAccessToken && isExiredRefreshToken => error
    // newGen

    // findMember

    // const [response, isError]= this.authService.ValidateTokenFunc( payload.id)
    // response = {
    //   accessToken = ""
    //   refreshToken = ""
    //   member: Member
    // }
    // if (isError) {
    // return isError
    // }else {
    //   const accessToken = `AccessToken=${
    //     longinResponse.data.token
    //   }; HttpOnly; Path=/; Max-Age=${dayjs().add(10, 'second')}`

    //   const RefreshToken = `RefreshToken=${
    //     longinResponse.data.token
    //   }; HttpOnly; Path=/; Max-Age=${dayjs().add(10, 'second')}`

    // }

    // request.res.setHeader('Set-Cookie', [accessToken, RefreshToken])
    // return response.member
  }
}
