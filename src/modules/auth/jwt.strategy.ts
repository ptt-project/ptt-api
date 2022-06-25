import { HttpStatus, Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { httpError } from '../../utils/response-error'
import { jwtConstants } from './auth.constants'
import { AuthService } from './auth.service'
import { TokenType } from './login.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    })
  }

  async validate(payload: TokenType): Promise<any> {
    console.log('validate JwtStrategy')
    console.log('payload.id', payload.id)

    return { id: payload.id }
    // const user = await this.userService.getUserWithId(payload.id)
    // if (!user) {
    //   httpError(HttpStatus.UNAUTHORIZED)
    // }
    // return user
  }
}
