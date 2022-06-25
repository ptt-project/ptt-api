import { Injectable } from '@nestjs/common'
import { response } from 'src/utils/response'
import { OtpService } from '../otp/otp.service'
import { Member } from '../../db/entities/Member'
import { hashPassword } from 'src/utils/helpers'
import { RegisterRequestDto } from './dto/register.dto'
import {
  InternalSeverError,
  UnableRegisterEmailAlreayExist,
  UnableRegisterUsernameAlreayExist,
  UnableInsertMemberToDbError,
} from 'src/utils/response-code'
import { validateBadRequest, validateError } from 'src/utils/response-error'

export type InquiryMemberExistType = (
  params: RegisterRequestDto,
) => Promise<[number, string]>

export type InsertMemberToDbTye = (
  params: RegisterRequestDto,
) => Promise<[Member, string]>

@Injectable()
export class AuthService {
  constructor(private readonly otpService: OtpService) {}

  async helloWorld() {
    return response(undefined)
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
}
