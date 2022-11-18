import { Injectable } from '@nestjs/common'
import { Member } from '../../../db/entities/Member'
import { response } from 'src/utils/response'
import { checkPassword } from 'src/utils/helpers'
import { LoginRequestDto } from '../dto/login.dto'
import {
  UnableLoginUsernameDoNotAlreayExist,
  PasswordIsInvalid,
  UnableToGetShopInfo,
} from 'src/utils/response-code'
import { validateBadRequest } from 'src/utils/response-error'
import { GenAccessTokenType, GenRefreshTokenType } from '../type/auth.type'

import {
  InquiryUserExistByUsernameType,
  ValidatePasswordType,
} from '../type/login.type'

import { PinoLogger } from 'nestjs-pino'
import dayjs from 'dayjs'
import { EntityManager } from 'typeorm'
import { GetShopInfoType } from 'src/modules/shop/type/shop.type'

@Injectable()
export class LoginService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(LoginService.name)
  }

  LoginHandler(
    inquiryUserExistByUsername: Promise<InquiryUserExistByUsernameType>,
    inquiryShopByMemberIdFunc: Promise<GetShopInfoType>,
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

      const result = {
        accessToken,
        refreshToken,
        firstName: member.firstName,
        lastName: member.lastName,
        mobile: member.mobile,
        email: member.email,
        username: member.username,
        imageId: member.imageId,
      }

      if (member.role == 'Seller') {
        const [shop, getShopInfoError] = await (
          await inquiryShopByMemberIdFunc
        )(member.id)

        if (getShopInfoError != '') {
          return response(undefined, UnableToGetShopInfo, getShopInfoError)
        }
        result['approvelStatus'] = shop.approvalStatus
      }

      this.logger.info(`Done LoginHandler ${dayjs().diff(start)} ms`)
      return response(result)
    }
  }

  async InquiryUserExistByUsernameFunc(
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
        return [null, error.message]
      }

      this.logger.info(
        `Done InquiryUserExistByUsernameFunc ${dayjs().diff(start)} ms`,
      )
      return [member, '']
    }
  }

  async ValidatePasswordFunc(): Promise<ValidatePasswordType> {
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
