import { Injectable } from '@nestjs/common'
import { response } from 'src/utils/response'

import { Member } from 'src/db/entities/Member'

import { checkPassword, hashPassword } from 'src/utils/helpers'
import { internalSeverError } from 'src/utils/response-error'

import {
  UnableUpatePasswordToDb,
  OldPassowrdInvalid,
  UnableInquiryEmailExistByEmailError,
  UnableUpateLoginTokenToDb,
  UnableInquiryMemberExistByMobileError,
  UnableInquiryMemberExistByLoginTokenAndEmailError,
  UnableSendMessageToEmailError,
} from 'src/utils/response-code'

import {
  InquiryEmailExistByEmailType,
  InquiryMemberByIdType,
  InquiryMemberExistByLoginTokenAndEmailType,
  InquiryMemberExistByMobileType,
  SendMessageToEmailType,
  UpdateLoginTokenToMemberType,
  UpdatePasswordToMemberType,
  VadlidateOldPasswordType,
} from '../type/password.type'
import { PinoLogger } from 'nestjs-pino'
import dayjs from 'dayjs'
import { EntityManager } from 'typeorm'
import { GenAccessTokenType } from 'src/modules/auth/type/auth.type'
import { verifyOtpRequestDto } from 'src/modules/otp/dto/otp.dto'
import { InquiryVerifyOtpType } from 'src/modules/otp/type/otp.type'
import { EmailService, SendEmailType } from 'src/modules/email/service/email.service'
import { ChagnePasswordRequestDto, ForgotPasswordRequestDto, ResetPasswordEmailRequestDto, ResetPasswordMobileRequestDto } from '../dto/password.dto'

@Injectable()
export class PasswordService {
  constructor(
    private readonly logger: PinoLogger,
    private readonly emailService: EmailService,
  ) {
    this.logger.setContext(PasswordService.name)
  }

  ChangePasswordHandler(
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

  async InquiryMemberByIdFunc(): Promise<InquiryMemberByIdType> {
    return async (memberId: string): Promise<[Member, string]> => {
      const start = dayjs()
      let member: Member
      try {
        member = await Member.findOne({ id: memberId })

        if (!member) {
          return [member, 'Member not found']
        }
      } catch (error) {
        return [member, error.message]
      }

      this.logger.info(`Done InquiryMemberByIdFunc ${dayjs().diff(start)} ms`)
      return [member, '']
    }
  }

  async VadlidateOldPasswordFunc(): Promise<VadlidateOldPasswordType> {
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

  async UpdatePasswordToMemberFunc(): Promise<UpdatePasswordToMemberType> {
    return async (member: Member, newPassword: string): Promise<string> => {
      const start = dayjs()
      try {
        member.password = await hashPassword(newPassword)
        await member.save()
      } catch (error) {
        return error.message
      }

      this.logger.info(
        `Done UpdatePasswordToMemberFunc ${dayjs().diff(start)} ms`,
      )
      return ''
    }
  }

  ForgotPasswordHandler(
    inquiryEmailExistByEmail: Promise<InquiryEmailExistByEmailType>,
    genAccessToken: Promise<GenAccessTokenType>,
    updateLoginTokenToMember: Promise<UpdateLoginTokenToMemberType>,
    sendMessageToEmail: Promise<SendMessageToEmailType>
  ) {
    return async (body: ForgotPasswordRequestDto) => {
      const start = dayjs()
      const { email } = body
      
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

      const accessToken = await (await genAccessToken)(member)

      const updateLoginTokenToMemberError = await (await updateLoginTokenToMember)(
        member,
        accessToken,
      )
      if (updateLoginTokenToMemberError !== '') {
        return internalSeverError(
          UnableUpateLoginTokenToDb,
          updateLoginTokenToMemberError,
        )
      }

      const parmasSendEmailType: SendEmailType = {
        to: member.email,
        subject: 'เปลี่ยนรหัสผ่านใหม่บน Happy Shopping Express',
        templateName: 'forgot-password',
        context: { username: member.username, accessToken, email: member.email },
      }

      const sendMessageToEmailError = await (await sendMessageToEmail)(
        parmasSendEmailType,
      )
      if (sendMessageToEmailError !== '') {
        return internalSeverError(
          UnableSendMessageToEmailError,
          sendMessageToEmailError,
        )
      }

      this.logger.info(`Done ForgotPasswordHandler ${dayjs().diff(start)} ms`)
      return response(undefined)
    }
  }

  async SendMessageToEmailFunc(
  ): Promise<SendMessageToEmailType> {
    return async (params: SendEmailType)
    : Promise<string> => {
      const start = dayjs()
      const { to, subject, templateName, context } = params
      this.emailService.sendEmail({ to, subject, templateName, context })

      this.logger.info(`Done SendMessageToEmailFunc ${dayjs().diff(start)} ms`)
      return ''
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
          return [member, 'Email isn\'t already used']
        }
      } catch (error) {
        return [member, error]
      }

      this.logger.info(`Done InquiryMemberExistByEmailFunc ${dayjs().diff(start)} ms`)
      return [member, '']
    }
  }

  async UpdateLoginTokenToMemberFunc(): Promise<UpdateLoginTokenToMemberType> {
    return async (member: Member, loginToken: string): Promise<string> => {
      const start = dayjs()
      try {
        member.loginToken = loginToken
        await member.save()
      } catch (error) {
        return error
      }

      this.logger.info(
        `Done UpdateLoginTokenToMemberFunc ${dayjs().diff(start)} ms`,
      )
      return ''
    }
  }

  ResetPasswordEmailHandler(
    inquiryMemberExistByLoginTokenAndEmail: Promise<InquiryMemberExistByLoginTokenAndEmailType>,
    updateLoginTokenToMember: Promise<UpdateLoginTokenToMemberType>,
    updatePasswordToMember: Promise<UpdatePasswordToMemberType>,
  ) {
    return async (body: ResetPasswordEmailRequestDto) => {
      const start = dayjs()

        const { loginToken, email } = body

        const [member, inquiryMemberExistByLoginTokenAndEmailError] = await (await inquiryMemberExistByLoginTokenAndEmail)(
          loginToken,
          email
        )

        if (inquiryMemberExistByLoginTokenAndEmailError !== '') {
          return response(
            undefined,
            UnableInquiryMemberExistByLoginTokenAndEmailError,
            inquiryMemberExistByLoginTokenAndEmailError,
          )
        }

      const updatePasswordToMemberError = await (await updatePasswordToMember)(
        member,
        body.password,
      )
      if (updatePasswordToMemberError !== '') {
        return internalSeverError(
          UnableUpatePasswordToDb,
          updatePasswordToMemberError,
        )
      }

      const updateLoginTokenToMemberError = await (await updateLoginTokenToMember)(
        member,
        null,
      )
      if (updateLoginTokenToMemberError !== '') {
        return internalSeverError(
          UnableUpateLoginTokenToDb,
          updateLoginTokenToMemberError,
        )
      }

      this.logger.info(`Done ResetPasswordEmailHandler ${dayjs().diff(start)} ms`)
      return response(undefined)
    }
  }

  async InquiryMemberExistByLoginTokenAndEmailFunc(
    etm: EntityManager,
  ): Promise<InquiryMemberExistByLoginTokenAndEmailType> {
    return async (loginToken: string, email: string): Promise<[Member, string]> => {
      const start = dayjs()
      let member: Member
      try {
        member = await etm.findOne(Member, {
          where: [
            {
              loginToken,
              email,
            },
          ],
        })
        if (!member) {
          return [member, 'Can\'t reset password beacase member not found']
        }
      } catch (error) {
        return [member, error]
      }

      this.logger.info(`Done InquiryMemberExistByLoginTokenAndEmailFunc ${dayjs().diff(start)} ms`)
      return [member, '']
    }
  }

  ResetPasswordMobileHandler(
    inquiryVerifyOtp: Promise<InquiryVerifyOtpType>,
    inquiryMemberExistByMobile: Promise<InquiryMemberExistByMobileType>,
    updatePasswordToMember: Promise<UpdatePasswordToMemberType>,
  ) {
    return async (body: ResetPasswordMobileRequestDto) => {
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

      const [member, inquiryMemberExistByMobileError] = await (await inquiryMemberExistByMobile)(
        body.mobile,
      )

      if (inquiryMemberExistByMobileError !== '') {
        return response(
          undefined,
          UnableInquiryMemberExistByMobileError,
          inquiryMemberExistByMobileError,
        )
      }

      const updatePasswordToMemberError = await (await updatePasswordToMember)(
        member,
        body.password,
      )
      if (updatePasswordToMemberError !== '') {
        return internalSeverError(
          UnableUpatePasswordToDb,
          updatePasswordToMemberError,
        )
      }

      this.logger.info(`Done ResetPasswordMobileHandler ${dayjs().diff(start)} ms`)
      return response(undefined)
    }
  }

  async InquiryMemberExistByMobileFunc(
    etm: EntityManager,
  ): Promise<InquiryMemberExistByMobileType> {
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
