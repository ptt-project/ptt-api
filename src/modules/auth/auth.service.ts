import { Injectable } from '@nestjs/common'
import { response } from 'src/utils/response'
import { InquiryVerifyOtpType, OtpService } from '../otp/otp.service'
import { Member } from '../../db/entities/Member'
import { hashPassword } from 'src/utils/helpers'
import { RegisterRequestDto } from './dto/register.dto'

import { JwtService } from '@nestjs/jwt'
import dayjs, { Dayjs } from 'dayjs'

import {
  validateBadRequest,
  internalSeverError,
} from 'src/utils/response-error'
import {
  InternalSeverError,
  UnableRegisterEmailAlreayExist,
  UnableRegisterUsernameAlreayExist,
  UnableInsertMemberToDbError,
  UnableToAddMobile,
} from 'src/utils/response-code'

import { verifyOtpRequestDto } from '../otp/dto/otp.dto'
import { EntityManager } from 'typeorm'
import { InquiryAddMobileType } from '../mobile/mobile.service'

export type InquiryMemberExistType = (
  params: RegisterRequestDto,
) => Promise<[number, string]>

export type InsertMemberToDbTye = (
  params: RegisterRequestDto,
  manager: EntityManager,
) => Promise<[Member, string]>

export type GenAccessTokenType = (member: Member) => Promise<string>

export type GenRefreshTokenType = (member: Member) => Promise<string>

export type InquiryUserExistByIdType = (id: number) => Promise<[Member, string]>

export type ValidateTokenType = (
  accessToken: string,
  refreshToken: string,
  id: number,
) => Promise<[ValidateTokenResponse, boolean]>

export type ExiredTokenType = (token: string) => Promise<boolean>

export type TokenType = {
  id: number
  expiredAt: Dayjs
}

export type ValidateTokenResponse = {
  accessToken: string
  refreshToken: string
  member: Member
}

@Injectable()
export class AuthService {
  constructor(
    private readonly otpService: OtpService,
    private readonly jwtService: JwtService,
  ) {}

  

  validateRegisterHandler(validateMember: Promise<InquiryMemberExistType>) {
    return async (body: RegisterRequestDto) => {
      const [validateErrorCode, validateErrorMessage] = await (
        await validateMember
      )(body)
      if (validateErrorCode != 0) {
        return response(undefined, validateErrorCode, validateErrorMessage)
      }

      return response(undefined)
    }
  }

  registerHandler(
    inquiryVerifyOtp: Promise<InquiryVerifyOtpType>,
    inquiryMemberEixst: Promise<InquiryMemberExistType>,
    insertMemberToDb: Promise<InsertMemberToDbTye>,
    addMobileFunc: Promise<InquiryAddMobileType>,
  ) {
    return async (body: RegisterRequestDto, manager: EntityManager) => {
      const verifyOtpData: verifyOtpRequestDto = {
        reference: body.mobile,
        refCode: body.refCode,
        otpCode: body.otpCode,
      }
      const [verifyOtpErrorCode, verifyOtpErrorMessege] = await (
        await inquiryVerifyOtp
      )(verifyOtpData, manager)

      if (verifyOtpErrorCode != 0) {
        return response(undefined, verifyOtpErrorCode, verifyOtpErrorMessege)
      }

      const [validateErrorCode, validateErrorMessage] = await (
        await inquiryMemberEixst
      )(body)

      if (validateErrorCode != 0) {
        return response(undefined, validateErrorCode, validateErrorMessage)
      }

      const [member, insertMemberError] = await (await insertMemberToDb)(body, manager)
      if (insertMemberError != '') {
        return internalSeverError(
          UnableInsertMemberToDbError,
          insertMemberError,
        )
      }

      const addMobileErrorMessege = await (await addMobileFunc)({mobile: body.mobile, isPrimary: true}, member, manager)
      if (addMobileErrorMessege != '') {
        return validateBadRequest(UnableToAddMobile, addMobileErrorMessege)
      }

      return response(member)
    }
  }

  async inquiryMemberExistFunc(): Promise<InquiryMemberExistType> {
    return async (params: RegisterRequestDto): Promise<[number, string]> => {
      const { email, username } = params
      try {
        const member = await Member.findOne({
          where: [
            {
              email,
            },
            {
              username,
            },
          ],
        })
        if (!member) {
          return [0, '']
        }
        if (member.username === username) {
          return [UnableRegisterUsernameAlreayExist, 'Username is already used']
        }
        if (member.email === email) {
          return [UnableRegisterEmailAlreayExist, 'Email is already used']
        }
      } catch (error) {
        return [InternalSeverError, error]
      }

      return [0, '']
    }
  }

  async insertMemberToDbFunc(): Promise<InsertMemberToDbTye> {
    return async (params: RegisterRequestDto, manager: EntityManager): Promise<[Member, string]> => {
      const {
        username,
        firstName,
        lastName,
        password,
        mobile,
        pdpaStatus,
        email,
      } = params

      let member: Member
      try {
        member = Member.create({
          username: username,
          firstname: firstName,
          lastname: lastName,
          password: await hashPassword(password),
          mobile: mobile,
          pdpaStatus: pdpaStatus,
          email: email,
        })

        await manager.save(member)
      } catch (error) {
        return [member, error]
      }

      return [member, '']
    }
  }

  async validateTokenHandler(
    exiredToken: Promise<ExiredTokenType>,
    inquiryUserExistById: Promise<InquiryUserExistByIdType>,
    genAccessToken: Promise<GenAccessTokenType>,
    genRefreshToken: Promise<GenAccessTokenType>,
  ): Promise<ValidateTokenType> {
    return async (
      accessToken: string,
      refreshToken: string,
      id: number,
    ): Promise<[ValidateTokenResponse, boolean]> => {
      const isExiredAccessToken = await (await exiredToken)(accessToken)
      const isExiredRefreshToken = await (await exiredToken)(refreshToken)

      if (isExiredAccessToken && isExiredRefreshToken) {
        return [null, true]
      }

      const [member, inquiryUserExistByUsernameError] = await (
        await inquiryUserExistById
      )(id)

      if (inquiryUserExistByUsernameError != '') {
        ;[null, true]
      }

      const newAccessToken = await (await genAccessToken)(member)
      const newRefreshToken = await (await genRefreshToken)(member)
      const response = {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        member: member,
      }

      return [response, false]
    }
  }

  async exiredTokenFunc(): Promise<ExiredTokenType> {
    return async (token: string): Promise<boolean> => {
      const decodedTokenFromJwt = this.jwtService.decode(token) as TokenType
      const tokenDate = decodedTokenFromJwt.expiredAt
      const isExiredToken = dayjs().isAfter(tokenDate)
      return isExiredToken
    }
  }

  async inquiryUserExistByIdFunc(): Promise<InquiryUserExistByIdType> {
    return async (id: number): Promise<[Member, string]> => {
      let member: Member
      try {
        member = await Member.findOne({
          where: [
            {
              id,
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

  async genAccessTokenFunc(): Promise<GenAccessTokenType> {
    return async (member: Member): Promise<string> => {
      const payload: TokenType = {
        id: member.id,
        expiredAt: dayjs().add(1, 'day'),
      }
      return this.jwtService.sign(payload)
    }
  }

  async genRefreshTokenFunc(): Promise<GenRefreshTokenType> {
    return async (member: Member): Promise<string> => {
      const payload: TokenType = {
        id: member.id,
        expiredAt: dayjs().add(7, 'day'),
      }
      return this.jwtService.sign(payload)
    }
  }
}
