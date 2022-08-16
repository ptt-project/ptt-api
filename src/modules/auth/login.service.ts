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

import {
  InquiryUserExistByUsernameType,
  ValidatePasswordType,
} from './login.type'

import { PinoLogger } from 'nestjs-pino'
import dayjs from 'dayjs'
import { EntityManager } from 'typeorm'

@Injectable()
export class LoginService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(LoginService.name)
  }

  loginHandler(
    inquiryUserExistByUsername: Promise<InquiryUserExistByUsernameType>,
    validatePassword: Promise<ValidatePasswordType>,
    genAccessToken: Promise<GenAccessTokenType>,
    genRefreshToken: Promise<GenRefreshTokenType>,
  ): any {
    return async (body: LoginRequestDto) => {
      const start = dayjs()
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

      this.logger.info(`Done loginHandler ${dayjs().diff(start)} ms`)
      return response({
        accessToken,
        refreshToken,
        firstName: member.firstName,
        lastName: member.lastName,
        mobile: member.mobile,
        email: member.email,
        username: member.username,
      })
    }
  }

  async inquiryUserExistByUsernameFunc(
    etm: EntityManager,
  ): Promise<InquiryUserExistByUsernameType> {
    return async (username: string): Promise<[Member, string]> => {
      const start = dayjs()
      let member: Member
      try {
        member = await etm.findOne(Member, {
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

      this.logger.info(
        `Done InquiryUserExistByUsernameFunc ${dayjs().diff(start)} ms`,
      )
      return [member, '']
    }
  }

  async validatePasswordFunc(): Promise<ValidatePasswordType> {
    return async (
      password: string,
      passwordMember: string,
    ): Promise<string> => {
      const start = dayjs()
      const isValidPass = await checkPassword(password, passwordMember)
      if (!isValidPass) {
        return 'Password is invalid'
      }

      this.logger.info(`Done ValidatePasswordFunc ${dayjs().diff(start)} ms`)
      return ''
    }
  }
}
