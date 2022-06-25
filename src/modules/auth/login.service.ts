import { Injectable } from '@nestjs/common'
import { Member } from '../../db/entities/Member'
import { response } from 'src/utils/response'
import { checkPassword } from 'src/utils/helpers'
import { LoginRequestDto } from './dto/login.dto';
import {
  InternalSeverError,
  UnableLoginUsernameDoNotAlreayExist,
  PasswordIsInvalid,
} from 'src/utils/response-code'
import { validateBadRequest} from 'src/utils/response-error'
import { JwtService } from '@nestjs/jwt';

export type validateUserFormDbTye = (
  params: LoginRequestDto,
) => Promise<[any, string]>

@Injectable()
export class LoginService {
  constructor(private readonly jwtService: JwtService) {}

  loginHandler(
    validateUser: Promise<validateUserFormDbTye>,
  ){
    return async (body: LoginRequestDto) => {
      const [member, validateUserError] = await (
        await validateUser
      )(body);

      if(validateUserError != ''){
        return validateBadRequest(member, validateUserError)
      }

      const jwtToken = await this.genJwt(member.username);

      const response = {token: jwtToken, firstname: member.firstname, lastname: member.lastname, mobile:member.mobile, email:member.email, username: member.username, }

      return response;

    }
  }
  
  async validateUserFunc(): Promise<validateUserFormDbTye> {
    return async (params: LoginRequestDto) => {
      const { username, password } = params
      try {
        const member = await Member.findOne({
          where: [{
            username
          }]
        })
        // console.log('member', member)
        if (!member) {
          return [UnableLoginUsernameDoNotAlreayExist, 'Username is not already used']
        }
        if (member.username === username) {
          
          // validate password
          const isValidPass = await checkPassword(password, member.password);
          if (!isValidPass) {
            return [PasswordIsInvalid, 'Password is invalid'];
          }
          member.firstname
          return [member, ''];
        }
      } catch (error) {
        return [InternalSeverError, error]
      }
    }
  }

  async genJwt(username) {
    const payload = { username: username, };
    return this.jwtService.sign(payload)
  }
}
