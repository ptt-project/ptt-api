import { Injectable } from '@nestjs/common'

import { Member } from 'src/db/entities/Member'
import {
  UnableToUpdateEmailToDb,
  UnableToSendEmail,
  OldPassowrdInvalid,
  UnableRegisterEmailAlreayExist,
} from 'src/utils/response-code'
import { checkPassword } from 'src/utils/helpers'

import { internalSeverError } from 'src/utils/response-error'
import { response } from 'src/utils/response'
import { EditEmailRequestDto } from '../dto/editEmail.dto'
import { EntityManager } from 'typeorm'
import { PinoLogger } from 'nestjs-pino'
import dayjs from 'dayjs'
import { EmailService } from 'src/modules/email/service/email.service'

export type UpdateEmailToMemberType = (
  member: Member,
  newEmail: string,
  manager: EntityManager,
) => Promise<string>

export type ValidatePasswordType = (
  password: string,
  passwordParams: string,
) => Promise<string>

export type NotifyNewEmailType = (
  member: Member,
  newEmail: string,
) => Promise<string>

export type ValidateEmailType = (
  email: string,
  member: Member,
  manager: EntityManager,
) => Promise<string>

@Injectable()
export class MemberEmailService {
  constructor(
    private readonly emailService: EmailService,
    private readonly logger: PinoLogger
  ) {
    this.logger.setContext(MemberEmailService.name)
  }

  editEmailHandler(
    validatePassword: Promise<ValidatePasswordType>,
    validateEmail: Promise<ValidateEmailType>,
    updateEmailToMember: Promise<UpdateEmailToMemberType>,
    notifyNewEmail: Promise<NotifyNewEmailType>,
  ) {
    return async (
      member: Member,
      body: EditEmailRequestDto,
      manager: EntityManager,
    ) => {
      const start = dayjs()
      const { password, newEmail } = body

      const vadlidatePasswordError = await (await validatePassword)(
        member.password,
        password,
      )
      if (vadlidatePasswordError !== '') {
        return response(undefined, OldPassowrdInvalid, vadlidatePasswordError)
      }

      const vadlidateEmailError = await (await validateEmail)(
        newEmail,
        member,
        manager,
      )

      if (vadlidateEmailError !== '') {
        return response(
          undefined,
          UnableRegisterEmailAlreayExist,
          vadlidateEmailError,
        )
      }

      const updateEmailToMemberError = await (await updateEmailToMember)(
        member,
        newEmail,
        manager,
      )
      if (updateEmailToMemberError !== '') {
        return internalSeverError(
          UnableToUpdateEmailToDb,
          updateEmailToMemberError,
        )
      }

      const notifyNewEmailError = await (await notifyNewEmail)(member, newEmail)
      if (notifyNewEmailError !== '') {
        return internalSeverError(UnableToSendEmail, notifyNewEmailError)
      }

      this.logger.info(`Done EditEmailHandler ${dayjs().diff(start)} ms`)
      return response(undefined)
    }
  }

  async vadlidatePasswordFunc(): Promise<ValidatePasswordType> {
    return async (
      password: string,
      passwordParams: string,
    ): Promise<string> => {
      const start = dayjs()
      const invalidPasswordParams = await checkPassword(
        passwordParams,
        password,
      )
      if (!invalidPasswordParams) {
        return 'password is incorrect'
      }

      this.logger.info(`Done VadlidatePasswordFunc ${dayjs().diff(start)} ms`)
      return ''
    }
  }

  async vadlidateEmailFunc(): Promise<ValidateEmailType> {
    return async (
      email: string,
      member: Member,
      manager: EntityManager,
    ): Promise<string> => {
      const start = dayjs()
      const emailOwner = await manager.findOne(Member, {
        where: {
          email,
          deletedAt: null,
        },
      })

      if (emailOwner) {
        if (emailOwner.id === member.id) {
          return 'You currently use this email'
        } else {
          return 'This email has been used'
        }
      }

      this.logger.info(`Done VadlidateEmailFunc ${dayjs().diff(start)} ms`)
      return ''
    }
  }

  async updateEmailToMemberFunc(): Promise<UpdateEmailToMemberType> {
    return async (
      member: Member,
      newEmail: string,
      manager: EntityManager,
    ): Promise<string> => {
      const start = dayjs()
      try {
        member.email = newEmail
        await manager.save(member)
      } catch (error) {
        return error.message
      }

      this.logger.info(`Done UpdateEmailToMemberFunc ${dayjs().diff(start)} ms`)
      return ''
    }
  }

  async notifyNewEmailFunc(): Promise<NotifyNewEmailType> {
    return async (member: Member, newEmail: string): Promise<string> => {
      const start = dayjs()
      
      this.emailService.sendEmail({
        templateName: 'changeEmail',
        to: newEmail,
        context: member,
        subject: "เปลี่ยนอีเมลใหม่บน Happy Shopping Express",
      })

      this.logger.info(`Done NotifyNewEmailFunc ${dayjs().diff(start)} ms`)
      return ''
    }
  }
}
