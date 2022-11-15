import { Injectable } from '@nestjs/common'
import { response } from 'src/utils/response'
import { InquiryVerifyOtpType } from '../../otp/type/otp.type'
import { Member } from '../../../db/entities/Member'
import { hashPassword } from 'src/utils/helpers'
import {
  RegisterRequestDto,
  ValidateRegisterRequestDto,
} from '../dto/register.dto'

import { JwtService } from '@nestjs/jwt'
import dayjs from 'dayjs'

import { internalSeverError, validateError } from 'src/utils/response-error'
import {
  InternalSeverError,
  UnableRegisterEmailAlreayExist,
  UnableRegisterUsernameAlreayExist,
  UnableInsertMemberToDbError,
  UnableToAddMobile,
  InvalideInviteToken,
  UnableToInsertWallet,
  UnableToInsertHappyPoint,
  UnableRegisterMobileAlreayExist,
} from 'src/utils/response-code'

import { verifyOtpRequestDto } from '../../otp/dto/otp.dto'
import { EntityManager } from 'typeorm'
import { AddMobileFuncType } from '../../mobile/type/mobile.type'

import {
  InquiryMemberExistType,
  InsertMemberToDbTye,
  GenAccessTokenType,
  GenRefreshTokenType,
  InquiryUserExistByIdType,
  ValidateTokenType,
  ExiredTokenType,
  TokenType,
  ValidateTokenResponse,
  ValidateInviteTokenFuncType,
  ValidateMobileUsedFuncType,
} from '../type/auth.type'
import { PinoLogger } from 'nestjs-pino'
import { InsertWalletToDbFuncType } from '../../wallet/type/wallet.type'
import { InsertHappyPointToDbType } from '../../happy-point/type/happy-point.type'
import { Mobile } from 'src/db/entities/Mobile'

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(AuthService.name)
  }

  ValidateRegisterHandler(
    validateMember: Promise<InquiryMemberExistType>,
    validateMobile: Promise<ValidateMobileUsedFuncType>,
  ) {
    return async (body: ValidateRegisterRequestDto) => {
      const start = dayjs()
      const [validateErrorCode, validateErrorMessage] = await (
        await validateMember
      )(body)
      if (validateErrorCode != 0) {
        return validateError(validateErrorCode, validateErrorMessage)
      }

      const [validateMobileErrorCode, validateMobileErrorMessage] = await (
        await validateMobile
      )(body.mobile)
      if (validateMobileErrorCode != 0) {
        return validateError(validateMobileErrorCode, validateMobileErrorMessage)
      }

      this.logger.info(`Done validateRegisterHandler ${dayjs().diff(start)} ms`)
      return response(undefined)
    }
  }

  RegisterHandler(
    inquiryVerifyOtp: Promise<InquiryVerifyOtpType>,
    inquiryMemberEixst: Promise<InquiryMemberExistType>,
    validateMobile: Promise<ValidateMobileUsedFuncType>,
    validateInviteToken: Promise<ValidateInviteTokenFuncType>,
    insertMemberToDb: Promise<InsertMemberToDbTye>,
    addMobileFunc: Promise<AddMobileFuncType>,
    insertWalletToDb: Promise<InsertWalletToDbFuncType>,
    insertHappyPointToDb: Promise<InsertHappyPointToDbType>,
  ) {
    return async (body: RegisterRequestDto, cookies) => {
      const start = dayjs()
      const verifyOtpData: verifyOtpRequestDto = {
        reference: body.mobile,
        refCode: body.refCode,
        otpCode: body.otpCode,
      }
      const [verifyOtpErrorCode, verifyOtpErrorMessege] = await (
        await inquiryVerifyOtp
      )(verifyOtpData)

      if (verifyOtpErrorCode != 0) {
        return response(undefined, verifyOtpErrorCode, verifyOtpErrorMessege)
      }

      const [validateErrorCode, validateErrorMessage] = await (
        await inquiryMemberEixst
      )(body)

      if (validateErrorCode != 0) {
        return response(undefined, validateErrorCode, validateErrorMessage)
      }

      const [validateMobileErrorCode, validateMobileErrorMessage] = await (
        await validateMobile
      )(body.mobile)

      if (validateMobileErrorCode != 0) {
        return validateError(validateMobileErrorCode, validateMobileErrorMessage)
      }

      let inviter: Member;
      if (cookies.InvitationToken) {
        const [spCode, validateInviteTokenErrorCode, validateInviteTokenErrorMessage] = await (
          await validateInviteToken
        )(cookies.InvitationToken)

        if (spCode) {
          inviter = spCode
        }
  
        if (validateInviteTokenErrorCode != 0) {
          return response(undefined, validateInviteTokenErrorCode, validateInviteTokenErrorMessage)
        }
      }

      const [member, insertMemberError] = await (await insertMemberToDb)(body, inviter)
      if (insertMemberError != '') {
        return internalSeverError(
          UnableInsertMemberToDbError,
          insertMemberError,
        )
      }

      const addMobileErrorMessege = await (await addMobileFunc)(
        { mobile: body.mobile, isPrimary: true },
        member,
      )
      if (addMobileErrorMessege != '') {
        return response(undefined, UnableToAddMobile, addMobileErrorMessege)
      }

      delete member.spCodeId
      const [, insertWalletToDbError] = await (await insertWalletToDb)(
        member.id,
      )
      if (insertWalletToDbError != '') {
        return response(undefined, UnableToInsertWallet, insertWalletToDbError)
      }

      const [, insertHappyPointToDbError] = await (await insertHappyPointToDb)(
        member.id,
      )
      if (insertHappyPointToDbError != '') {
        return response(
          undefined,
          UnableToInsertHappyPoint,
          insertHappyPointToDbError,
        )
      }

      this.logger.info(`Done RegisterHandler ${dayjs().diff(start)} ms`)
      return response(member)
    }
  }

  async InquiryMemberExistFunc(
    etm: EntityManager,
  ): Promise<InquiryMemberExistType> {
    return async (
      params: RegisterRequestDto | ValidateRegisterRequestDto,
    ): Promise<[number, string]> => {
      const start = dayjs()
      const { email, username, mobile } = params
      try {
        const member = await etm.findOne(Member, {
          where: [
            {
              email,
              deletedAt: null,
            },
            {
              username,
              deletedAt: null,
            },
            {
              mobile,
              deletedAt: null,
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
        if (member.mobile === mobile) {
          return [UnableRegisterMobileAlreayExist, 'Mobile is already used']
        }
      } catch (error) {
        return [InternalSeverError, error.message]
      }

      this.logger.info(`Done InquiryMemberExistFunc ${dayjs().diff(start)} ms`)
      return [0, '']
    }
  }

  async ValidateMobileUsedFunc(
    etm: EntityManager,
  ): Promise<ValidateMobileUsedFuncType> {
    return async (
      mobilePhone: string,
    ): Promise<[number, string]> => {
      const start = dayjs()
      
      try {
        const mobile = await etm.findOne(Mobile, {
          where:
            {
              mobile: mobilePhone,
              deletedAt: null,
            },
        })
        if (mobile) {
          return [UnableRegisterMobileAlreayExist, 'Mobile is already used']
        }
      } catch (error) {
        return [InternalSeverError, error.message]
      }

      this.logger.info(`Done ValidateMobileUsedFunc ${dayjs().diff(start)} ms`)
      return [0, '']
    }
  }

  async ValidateInviteTokenFunc(
    etm: EntityManager,
  ): Promise<ValidateInviteTokenFuncType> {
    return async (
      inviteToken: string
    ): Promise<[Member, number, string]> => {
      const start = dayjs()
      let member: Member;
      const memberCode = this.jwtService.decode(inviteToken)
      try {
        member = await etm.findOne(Member, {
          where: { memberCode }
        })
        if (!member) {
          return [undefined, 0, '']
        }
      } catch (error) {
        return [undefined, InternalSeverError, error.message]
      }

      this.logger.info(`Done ValidateInviteTokenFunc ${dayjs().diff(start)} ms`)
      return [member, 0, '']
    }
  }

  async InsertMemberToDbFunc(etm: EntityManager): Promise<InsertMemberToDbTye> {
    return async (params: RegisterRequestDto, inviter?: Member): Promise<[Member, string]> => {
      const start = dayjs()
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
        member = etm.create(Member, {
          username,
          firstName,
          lastName,
          mobile,
          pdpaStatus,
          email,
          password: await hashPassword(password),
          memberCode: "*******",
          spCodeId: inviter?.id,
        })

        member = await etm.save(member)
        member.memberCode = `${member.no}`.padStart(7, '0')
        member = await etm.save(member)

        if (inviter) {
          inviter.relationIds.push(member.id)
          await etm.save(inviter)
        }
      } catch (error) {
        return [member, error.message]
      }

      this.logger.info(`Done InsertMemberToDbFunc ${dayjs().diff(start)} ms`)
      return [member, '']
    }
  }

  async ValidateTokenHandler(
    exiredToken: Promise<ExiredTokenType>,
    inquiryUserExistById: Promise<InquiryUserExistByIdType>,
    genAccessToken: Promise<GenAccessTokenType>,
    genRefreshToken: Promise<GenAccessTokenType>,
  ): Promise<ValidateTokenType> {
    return async (
      accessToken: string,
      refreshToken: string,
      id: string,
    ): Promise<[ValidateTokenResponse, boolean]> => {
      const start = dayjs()
      const isExiredAccessToken = await (await exiredToken)(accessToken)
      const isExiredRefreshToken = await (await exiredToken)(refreshToken)

      if (isExiredAccessToken && isExiredRefreshToken) {
        return [null, true]
      }

      const [member, inquiryUserExistByUsernameError] = await (
        await inquiryUserExistById
      )(id)

      if (inquiryUserExistByUsernameError != '') {
        return [null, true]
      }

      const newAccessToken = await (await genAccessToken)(member)
      const newRefreshToken = await (await genRefreshToken)(member)
      const response = {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        member: member,
      }

      this.logger.info(`Done ValidateTokenHandler ${dayjs().diff(start)} ms`)
      return [response, false]
    }
  }

  async ExiredTokenFunc(): Promise<ExiredTokenType> {
    return async (token: string): Promise<boolean> => {
      // const start = dayjs()
      const decodedTokenFromJwt = this.jwtService.decode(token) as TokenType
      const tokenDate = decodedTokenFromJwt.expiredAt
      const isExiredToken = dayjs().isAfter(tokenDate)

      // this.logger.info(`Done ExiredTokenFunc ${dayjs().diff(start)} ms`)
      return isExiredToken
    }
  }

  async InquiryUserExistByIdFunc(
    etm: EntityManager,
  ): Promise<InquiryUserExistByIdType> {
    return async (id: string): Promise<[Member, string]> => {
      const start = dayjs()
      let member: Member
      try {
        member = await etm
          .createQueryBuilder(Member, 'members')
          .leftJoinAndSelect('members.shop', 'shops')
          .leftJoinAndSelect('members.wallets', 'wallets')
          .leftJoinAndSelect('members.happyPoints', 'happyPoints')
          .where('members.deletedAt IS NULL')
          .andWhere('members.id = :id', { id })
          .getOne()

        if (!member) {
          return [null, 'Username is not already used']
        }
      } catch (error) {
        return [null, error.message]
      }

      this.logger.info(
        `Done InquiryUserExistByIdFunc ${dayjs().diff(start)} ms`,
      )
      return [member, '']
    }
  }

  async GenAccessTokenFunc(): Promise<GenAccessTokenType> {
    return async (member: Member): Promise<string> => {
      // const start = dayjs()
      const payload: TokenType = {
        id: member.id,
        expiredAt: dayjs().add(1, 'day'),
      }

      // this.logger.info(`Done GenAccessTokenFunc ${dayjs().diff(start)} ms`)
      return this.jwtService.sign(payload)
    }
  }

  async GenRefreshTokenFunc(): Promise<GenRefreshTokenType> {
    return async (member: Member): Promise<string> => {
      // const start = dayjs()
      const payload: TokenType = {
        id: member.id,
        expiredAt: dayjs().add(7, 'day'),
      }

      // this.logger.info(`Done GenRefreshTokenFunc ${dayjs().diff(start)} ms`)
      return this.jwtService.sign(payload)
    }
  }
}
