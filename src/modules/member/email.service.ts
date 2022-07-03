import { Injectable } from '@nestjs/common'

import { Member } from 'src/db/entities/Member'
import {
  UnableToUpdateEmailToDb,
  UnableToSendEmail,
  OldPassowrdInvalid,
} from 'src/utils/response-code'
import { checkPassword } from 'src/utils/helpers'

import { internalSeverError } from 'src/utils/response-error'
import { response } from 'src/utils/response'
import { EditEmailRequestDto } from './dto/editEmail.dto'

export type UpdateEmailToMemberType = (
  member: Member,
  newEmail: string,
) => Promise<string>

export type ValidatePasswordType = (
  password: string,
  passwordParams: string,
) => Promise<string>

export type NotifyNewEmailType = (
  member: Member,
  newEmail: string,
) => Promise<string>

@Injectable()
export class EmailService {
  editEmailHandler(
    validatePassword: Promise<ValidatePasswordType>,
    updateEmailToMember: Promise<UpdateEmailToMemberType>,
    notifyNewEmail: Promise<NotifyNewEmailType>
  ) {
    return async (member: Member, body: EditEmailRequestDto) => {
      const { password, newEmail } = body

      const vadlidateOldPasswordError = await (await validatePassword)(
        member.password,
        password,
      )

      if (vadlidateOldPasswordError !== '') {
        return response(
          undefined,
          OldPassowrdInvalid,
          vadlidateOldPasswordError,
        )
      }

      const updateEmailToMemberError = await (await updateEmailToMember)(
        member,
        newEmail,
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

  async updateEmailToMemberFunc(): Promise<UpdateEmailToMemberType> {
    return async (member: Member, newEmail: string): Promise<string> => {
      try {
        member.email = newEmail
        await member.save()
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
