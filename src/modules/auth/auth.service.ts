import { Injectable } from '@nestjs/common'
import { response } from 'src/utils/response'
import { OtpService } from '../otp/otp.service'
import { Member } from '../../db/entities/Member'
import { hashPassword } from 'src/utils/helpers'
import { RegisterRequestDto } from './dto/register.dto'

import { JwtService } from '@nestjs/jwt'
import dayjs, { Dayjs } from 'dayjs'

import { validateBadRequest, validateError } from 'src/utils/response-error'
import {
  InternalSeverError,
  UnableRegisterEmailAlreayExist,
  UnableRegisterUsernameAlreayExist,
  UnableInsertMemberToDbError,
} from 'src/utils/response-code'

export type TokenType = {
  id: number
  expiredAt: Dayjs
}

export type ValidateTokenResponse = {
  accessToken: string
  refreshToken: string
  member: Member
}

export type InquiryMemberExistType = (
  params: RegisterRequestDto,
) => Promise<[number, string]>

export type InsertMemberToDbTye = (
  params: RegisterRequestDto,
) => Promise<[Member, string]>

export type GenAccessTokenType = (member: Member) => Promise<string>

export type GenRefreshTokenType = (member: Member) => Promise<string>

export type InquiryUserExistByIdType = (
  id: number,
) => Promise<[Member, string]>

export type ValidateTokenType = (
  accessToken: string, 
  refreshToken: string,
  id: number,
) => Promise<[ValidateTokenResponse, boolean]>

export type ExiredTokenType = (
  token: string,
) => Promise<boolean>

@Injectable()
export class AuthService {
  constructor(
    private readonly otpService: OtpService,
    private readonly jwtService: JwtService,
  ) {}

  async getMe(member: Member) {
    return response(member)
  }

  async requestOtp(body) {
    return await this.otpService.requestOtp(body)
  }

  verifyOtp() {
    return async body => {
      return await this.otpService.verifyOtp(body)
    }
  }

  validate(validateMember) {
    return async (body: RegisterRequestDto) => {
      const [validateErrorCode, validateErrorMessage] = await validateMember(
        body,
      )
      if (validateErrorCode != 0) {
        return validateBadRequest(validateErrorCode, validateErrorMessage)
      }

      return response(undefined)
    }
  }

  registerHandler(
    verifyOtp,
    inquiryMemberEixst: Promise<InquiryMemberExistType>,
    insertMemberToDb: Promise<InsertMemberToDbTye>,
  ) {
    return async (body: RegisterRequestDto) => {
      const isValidOtp = await verifyOtp(body)
      if (!isValidOtp) {
        return response(undefined, '400', 'Otp is invalid')
      }

      const [validateErrorCode, validateErrorMessage] = await (
        await inquiryMemberEixst
      )(body)

      if (validateErrorCode != 0) {
        return validateBadRequest(validateErrorCode, validateErrorMessage)
      }

      const [member, insertMemberError] = await (await insertMemberToDb)(body)
      if (insertMemberError != '') {
        return validateError(UnableInsertMemberToDbError, insertMemberError)
      }

      return response(member)
    }
  }

  async inquiryMemberEixstFunc(): Promise<InquiryMemberExistType> {
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
          return [
            UnableRegisterUsernameAlreayExist,
            'Username is is already used',
          ]
        }
        if (member.email === email) {
          return [UnableRegisterEmailAlreayExist, 'Email is is already used']
        }
      } catch (error) {
        return [InternalSeverError, error]
      }

      return [0, '']
    }
  }

  async insertMemberToDbFunc(): Promise<InsertMemberToDbTye> {
    return async (params: RegisterRequestDto): Promise<[Member, string]> => {
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

        await member.save()
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
  ): Promise<ValidateTokenType>{
    return async (accessToken: string, refreshToken: string , id: number): Promise<[ValidateTokenResponse, boolean]> => {

      const isExiredAccessToken = await (await exiredToken)(accessToken)
      const isExiredRefreshToken = await (await exiredToken)(refreshToken)

      if(isExiredAccessToken && isExiredRefreshToken){
        return [null, true]
      }

      const [member, inquiryUserExistByUsernameError] = await (
        await inquiryUserExistById)(id)

      if(inquiryUserExistByUsernameError != ''){
        [null, true]
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

  async exiredTokenFunc(): Promise<ExiredTokenType>{
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
