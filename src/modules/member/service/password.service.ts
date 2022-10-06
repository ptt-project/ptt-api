import { Injectable } from '@nestjs/common'
import { response } from 'src/utils/response'

import { Member } from 'src/db/entities/Member'

import { checkPassword, hashPassword } from 'src/utils/helpers'
import { internalSeverError } from 'src/utils/response-error'

import { ChagnePasswordRequestDto } from '../dto/changePassword.dto'
import {
  UnableUpatePasswordToDb,
  OldPassowrdInvalid,
} from 'src/utils/response-code'

import {
  InquiryMemberByIdType,
  UpdatePasswordToMemberType,
  VadlidateOldPasswordType,
} from '../type/password.type'
import { PinoLogger } from 'nestjs-pino'
import dayjs from 'dayjs'

@Injectable()
export class PasswordService {
  constructor(private readonly logger: PinoLogger) {
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
        return [member, error.message]
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
        return error.message
      }

      this.logger.info(
        `Done UpdatePasswordToMemberFunc ${dayjs().diff(start)} ms`,
      )
      return ''
    }
  }
}
