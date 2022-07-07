import { Injectable } from '@nestjs/common'
import { Member } from '../../db/entities/Member'
import { response } from 'src/utils/response'
import { checkPassword } from 'src/utils/helpers'
import { LoginRequestDto } from './dto/login.dto'
import {
  UnableLoginUsernameDoNotAlreayExist,
  PasswordIsInvalid,
} from 'src/utils/response-code'
import { validateBadRequest } from 'src/utils/response-error'
import { GenAccessTokenType, GenRefreshTokenType } from './auth.type'
import { AuthService } from './auth.service'

import {
  InquiryUserExistByUsernameType,
  ValidatePasswordType,
} from './login.type'

@Injectable()
export class LoginService {
  constructor(private readonly authService: AuthService) {}

  loginHandler(
    inquiryUserExistByUsername: Promise<InquiryUserExistByUsernameType>,
    validatePassword: Promise<ValidatePasswordType>,
    genAccessToken: Promise<GenAccessTokenType>,
    genRefreshToken: Promise<GenRefreshTokenType>,
  ): any {
    return async (body: LoginRequestDto) => {
      const [member, inquiryUserExistByUsernameError] = await (
        await inquiryUserExistByUsername
      )(body.username)

      if (inquiryUserExistByUsernameError != '') {
        return validateBadRequest(
          UnableLoginUsernameDoNotAlreayExist,
          inquiryUserExistByUsernameError,
        )
      }

      const validatePasswordError = await (await validatePassword)(
        body.password,
        member.password,
      )
      if (validatePasswordError != '') {
        return validateBadRequest(PasswordIsInvalid, validatePasswordError)
      }

      const accessToken = await (await genAccessToken)(member)
      const refreshToken = await (await genRefreshToken)(member)

      return response({
        accessToken,
        refreshToken,
        firstname: member.firstname,
        lastname: member.lastname,
        mobile: member.mobile,
        email: member.email,
        username: member.username,
      })
    }
  }

  async inquiryUserExistByUsernameFunc(): Promise<
    InquiryUserExistByUsernameType
  > {
    return async (username: string): Promise<[Member, string]> => {
      let member: Member
      try {
        member = await Member.findOne({
          where: [
            {
              username,
            },
          ],
        })
        if (!member) {
          return [null, 'Username is not already used']
        }
      } catch (error) {
        return [null, error]
      }

      return [member, '']
    }
  }

  async validatePasswordFunc(): Promise<ValidatePasswordType> {
    return async (
      password: string,
      passwordMember: string,
    ): Promise<string> => {
      const isValidPass = await checkPassword(password, passwordMember)
      if (!isValidPass) {
        return 'Password is invalid'
      }

      return ''
    }
  }
}
