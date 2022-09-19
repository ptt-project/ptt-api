import { Injectable } from '@nestjs/common'
import { response } from 'src/utils/response'

import { Member } from 'src/db/entities/Member'

import { checkPassword, hashPassword } from 'src/utils/helpers'
import { internalSeverError } from 'src/utils/response-error'

import { ChagnePasswordRequestDto } from './dto/changePassword.dto'
import {
  UnableUpatePasswordToDb,
  OldPassowrdInvalid,
  UnableInquiryEmailExistByMobileError,
  InvalidJSONString,
  UnableInquiryEmailExistByEmailError,
} from 'src/utils/response-code'
import {
  InquiryEmailExistByEmailType,
  InquiryEmailExistByMobileType,
  InquiryMemberByIdType,
  UpdatePasswordToMemberType,
  VadlidateOldPasswordType,
} from './password.type'
import { PinoLogger } from 'nestjs-pino'
import dayjs from 'dayjs'
import { EntityManager } from 'typeorm'
import { verifyOtpRequestDto } from '../otp/dto/otp.dto'
import { InquiryVerifyOtpType } from '../otp/otp.type'
import { EmailService } from '../email/email.service'
import { ForgotPasswordRequestDto } from './dto/forgotPassword.dto'
import { ResetPasswordRequestDto } from './dto/resetPassword.dto'

@Injectable()
export class PasswordService {
  constructor(
    private readonly logger: PinoLogger,
    private readonly emailService: EmailService,
  ) {
    this.logger.setContext(PasswordService.name)
  }

  changePasswordHandler(
    vadlidateOldPassword: Promise<VadlidateOldPasswordType>,
    updatePasswordToMember: Promise<UpdatePasswordToMemberType>,
  ) {
    return async (member: Member, body: ChagnePasswordRequestDto) => {
      const start = dayjs()
      const { oldPassword, newPassword } = body

      const vadlidateOldPasswordError = await (await vadlidateOldPassword)(
        member.password,
        oldPassword,
      )

      if (vadlidateOldPasswordError !== '') {
        return response(
          undefined,
          OldPassowrdInvalid,
          vadlidateOldPasswordError,
        )
      }

      const updatePasswordToMemberError = await (await updatePasswordToMember)(
        member,
        newPassword,
      )
      if (updatePasswordToMemberError !== '') {
        return internalSeverError(
          UnableUpatePasswordToDb,
          updatePasswordToMemberError,
        )
      }

      this.logger.info(`Done ChangePasswordHandler ${dayjs().diff(start)} ms`)
      return response(undefined)
    }
  }

  async inquiryMemberByIdFunc(): Promise<InquiryMemberByIdType> {
    return async (memberId: number): Promise<[Member, string]> => {
      const start = dayjs()
      let member: Member
      try {
        member = await Member.findOne({ id: memberId })

        if (!member) {
          return [member, 'Member not found']
        }
      } catch (error) {
        return [member, error]
      }

      this.logger.info(`Done InquiryMemberByIdFunc ${dayjs().diff(start)} ms`)
      return [member, '']
    }
  }

  async vadlidateOldPasswordFunc(): Promise<VadlidateOldPasswordType> {
    return async (
      oldPassword: string,
      oldPasswordParams: string,
    ): Promise<string> => {
      const start = dayjs()
      const invalidOldPasswordParams = await checkPassword(
        oldPasswordParams,
        oldPassword,
      )
      if (!invalidOldPasswordParams) {
        return 'current password is wrong'
      }

      this.logger.info(
        `Done VadlidateOldPasswordFunc ${dayjs().diff(start)} ms`,
      )
      return ''
    }
  }

  async updatePasswordToMemberFunc(): Promise<UpdatePasswordToMemberType> {
    return async (member: Member, newPassword: string): Promise<string> => {
      const start = dayjs()
      try {
        member.password = await hashPassword(newPassword)
        await member.save()
      } catch (error) {
        return error
      }

      this.logger.info(
        `Done UpdatePasswordToMemberFunc ${dayjs().diff(start)} ms`,
      )
      return ''
    }
  }

  ForgotPasswordHandler(
    inquiryEmailExistByEmail: Promise<InquiryEmailExistByEmailType>,
  ) {
    return async (query: ForgotPasswordRequestDto) => {
      const start = dayjs()

      const { email } = query

      const [member, inquiryEmailExistByEmailError] = await (await inquiryEmailExistByEmail)(
        email,
      )

      if (inquiryEmailExistByEmailError !== '') {
        return response(
          undefined,
          UnableInquiryEmailExistByEmailError,
          inquiryEmailExistByEmailError,
        )
      }

      this.emailService.sendEmail({
        to: email,
        subject: 'เปลี่ยนรหัสผ่านใหม่บน Happy Shopping Express',
        templateName: 'forgot-password',
        context: { username: member.username },
      })

      this.logger.info(`Done forgotPasswordHandler ${dayjs().diff(start)} ms`)
      return response(undefined)
    }
  }

  async InquiryMemberExistByEmailFunc(
    etm: EntityManager,
  ): Promise<InquiryEmailExistByEmailType> {
    return async (email: string): Promise<[Member, string]> => {
      const start = dayjs()
      let member: Member
      try {
        member = await etm.findOne(Member, {
          where: [
            {
              email,
            },
          ],
        })
        if (!member) {
          return [member, 'Email is not already used']
        }
      } catch (error) {
        return [member, error]
      }

      this.logger.info(`Done InquiryMemberExistByEmailFunc ${dayjs().diff(start)} ms`)
      return [member, '']
    }
  }

  ResetPasswordHandler(
    inquiryVerifyOtp: Promise<InquiryVerifyOtpType>,
    inquiryEmailExistByEmail: Promise<InquiryEmailExistByEmailType>,
    inquiryEmailExistByMobile: Promise<InquiryEmailExistByMobileType>,
    updatePasswordToMember: Promise<UpdatePasswordToMemberType>,
  ) {
    return async (body: ResetPasswordRequestDto) => {
      const start = dayjs()

      let memberResult: Member

      const validEmailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

      if ((body.username).match(validEmailRegex)) {
        const { username } = body

        const [member, inquiryEmailExistByEmailError] = await (await inquiryEmailExistByEmail)(
          username,
        )

        if (inquiryEmailExistByEmailError !== '') {
          return response(
            undefined,
            UnableInquiryEmailExistByEmailError,
            inquiryEmailExistByEmailError,
          )
        }

        memberResult = member

      } else {
        if(body.otpCode == undefined){
          return response(
            undefined,
            InvalidJSONString,
            'otpCode should not be empty',
          )
        }

        if(body.refCode == undefined){
          return response(
            undefined,
            InvalidJSONString,
            'refCode should not be empty',
          )
        }

        const [member, inquiryEmailExistByMobileError] = await (await inquiryEmailExistByMobile)(
          body.username,
        )

        if (inquiryEmailExistByMobileError !== '') {
          return response(
            undefined,
            UnableInquiryEmailExistByMobileError,
            inquiryEmailExistByMobileError,
          )
        }

        const verifyOtpData: verifyOtpRequestDto = {
          reference: body.username,
          refCode: body.refCode,
          otpCode: body.otpCode,
        }

        const [verifyOtpErrorCode, verifyOtpErrorMessege] = await (
          await inquiryVerifyOtp
        )(verifyOtpData)
  
        if (verifyOtpErrorCode != 0) {
          return response(undefined, verifyOtpErrorCode, verifyOtpErrorMessege)
        }

        memberResult = member
      }

      const updatePasswordToMemberError = await (await updatePasswordToMember)(
        memberResult,
        body.password,
      )
      if (updatePasswordToMemberError !== '') {
        return internalSeverError(
          UnableUpatePasswordToDb,
          updatePasswordToMemberError,
        )
      }




      this.logger.info(`Done forgotPasswordHandler ${dayjs().diff(start)} ms`)
      return response(undefined)
    }
  }

  async InquiryMemberExistByMobileFunc(
    etm: EntityManager,
  ): Promise<InquiryEmailExistByMobileType> {
    return async (mobile: string): Promise<[Member, string]> => {
      const start = dayjs()
      let member: Member
      try {
        member = await etm.findOne(Member, {
          where: [
            {
              mobile,
            },
          ],
        })
        if (!member) {
          return [member, 'mobile is not already used']
        }
      } catch (error) {
        return [member, error]
      }

      this.logger.info(`Done InquiryMemberExistByMobileFunc ${dayjs().diff(start)} ms`)
      return [member, '']
    }
  }

}
