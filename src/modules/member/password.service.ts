import { Injectable } from '@nestjs/common'

import { Member } from 'src/db/entities/Member'
import {
  UnableUpatePasswordToDb,
  OldPassowrdInvalid,
} from 'src/utils/response-code'
import { checkPassword, hashPassword } from 'src/utils/helpers'

import { internalSeverError } from 'src/utils/response-error'
import { ChagnePasswordRequestDto } from './dto/changePassword.dto'
import { response } from 'src/utils/response'

export type InquiryMemberByIdType = (
  memberId: number,
) => Promise<[Member, string]>

export type UpdatePasswordToMemberType = (
  member: Member,
  newPassword: string,
) => Promise<string>

export type VadlidateOldPasswordType = (
  oldPassword: string,
  oldPasswordParams: string,
) => Promise<string>

@Injectable()
export class PasswordService {
  changePasswordHandler(
    vadlidateOldPassword: Promise<VadlidateOldPasswordType>,
    updatePasswordToMember: Promise<UpdatePasswordToMemberType>,
  ) {
    return async (member: Member, body: ChagnePasswordRequestDto) => {
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

      return response(undefined)
    }
  }

  async inquiryMemberByIdFunc(): Promise<InquiryMemberByIdType> {
    return async (memberId: number): Promise<[Member, string]> => {
      let member: Member
      try {
        member = await Member.findOne({ id: memberId })

        if (!member) {
          return [member, 'Member not found']
        }
      } catch (error) {
        return [member, error]
      }

      return [member, '']
    }
  }

  async vadlidateOldPasswordFunc(): Promise<VadlidateOldPasswordType> {
    return async (
      oldPassword: string,
      oldPasswordParams: string,
    ): Promise<string> => {
      const invalidOldPasswordParams = await checkPassword(
        oldPasswordParams,
        oldPassword,
      )
      if (!invalidOldPasswordParams) {
        return 'current password is wrong'
      }

      return ''
    }
  }

  async updatePasswordToMemberFunc(): Promise<UpdatePasswordToMemberType> {
    return async (member: Member, newPassword: string): Promise<string> => {
      try {
        member.password = await hashPassword(newPassword)
        await member.save()
      } catch (error) {
        return error
      }

      return ''
    }
  }
}
