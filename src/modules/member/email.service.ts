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
import { EditEmailRequestDto } from './dto/editEmail.dto'
import { EntityManager } from 'typeorm'

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
export class EmailService {
  editEmailHandler(
    validatePassword: Promise<ValidatePasswordType>,
    validateEmail: Promise<ValidateEmailType>,
    updateEmailToMember: Promise<UpdateEmailToMemberType>,
    notifyNewEmail: Promise<NotifyNewEmailType>
  ) {
    return async (member: Member, body: EditEmailRequestDto, manager: EntityManager) => {
      const { password, newEmail } = body

      const vadlidatePasswordError = await (await validatePassword)(
        member.password,
        password,
      )

      if (vadlidatePasswordError !== '') {
        return response(
          undefined,
          OldPassowrdInvalid,
          vadlidatePasswordError,
        )
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

      const notifyNewEmailError = await (await notifyNewEmail)(
        member,
        newEmail,
      )
      if (notifyNewEmailError !== '') {
        return internalSeverError(
          UnableToSendEmail,
          notifyNewEmailError,
        )
      }

      return response(undefined)
    }
  }

  async vadlidatePasswordFunc(): Promise<ValidatePasswordType> {
    return async (
      password: string,
      passwordParams: string,
    ): Promise<string> => {
      const invalidPasswordParams = await checkPassword(
        passwordParams,
        password,
      )
      if (!invalidPasswordParams) {
        return 'password is incorrect'
      }

      return ''
    }
  }

  async vadlidateEmailFunc(): Promise<ValidateEmailType> {
    return async (
      email: string,
      member: Member,
      manager: EntityManager,
    ): Promise<string> => {
      const emailOwner = await manager.findOne(Member, {
        where: {
          email,
          deletedAt: null,
        }
      })

      if (emailOwner) {
        if (emailOwner.id === member.id) {
          return 'You currently use this email'
        } else {
          return 'This email has been used'
        }
      }

      return ''
    }
  }

  async updateEmailToMemberFunc(): Promise<UpdateEmailToMemberType> {
    return async (member: Member, newEmail: string, manager: EntityManager): Promise<string> => {
      try {
        member.email = newEmail
        await manager.save(member)
      } catch (error) {
        return error
      }

      return ''
    }
  }

  async notifyNewEmailFunc(): Promise<NotifyNewEmailType> {
    return async (member: Member, newEmail: string): Promise<string> => {
      // send email // Failed to send email

      return ''
    }
  }
}
