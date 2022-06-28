import { Injectable } from '@nestjs/common'
import { response } from 'src/utils/response'
import { OtpService, VerifyOtpHandler } from '../otp/otp.service'
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
import { verifyOtpRequestDto } from '../otp/dto/otp.dto'

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

  validate(validateMember: Promise<InquiryMemberExistType>) {
    return async (body: RegisterRequestDto) => {
      console.log(body)
      const [validateErrorCode, validateErrorMessage] = await (await validateMember)(
        body,
      )
      if (validateErrorCode != 0) {
        return validateBadRequest(validateErrorCode, validateErrorMessage)
      }

      return response(undefined)
    }
  }

  registerHandler(
    verifyOtp: Promise<VerifyOtpHandler>,
    inquiryMemberEixst: Promise<InquiryMemberExistType>,
    insertMemberToDb: Promise<InsertMemberToDbTye>,
  ) {
    return async (body: RegisterRequestDto) => {
      const verifyOtpData: verifyOtpRequestDto = {
        reference: body.mobile,
        refCode: body.refCode,
        otpCode: body.otpCode,
      }
      await (await verifyOtp)(verifyOtpData)

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
    return async (params: RegisterRequestDto) => {
      const { email, username } = params
      console.log('email, username')
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
            'Username is already used',
          ]
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
    return async (params: RegisterRequestDto) => {
      const {
        username,
        firstName,
        lastName,
        password,
        mobile,
        pdpaStatus,
        email,
        gender,
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
          gender: gender,
        })

        await member.save()
      } catch (error) {
        return [member, error]
      }

      return [member, '']
    }
  }
}
