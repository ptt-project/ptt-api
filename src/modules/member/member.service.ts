import { Injectable } from '@nestjs/common'

import { Member } from 'src/db/entities/Member'
import {
  UnableInquiryMemberExistById,
  UnableUpatePasswordToDb,
} from 'src/utils/response-code'
import { hashPassword } from 'src/utils/helpers'

import { validateBadRequest } from 'src/utils/response-error'
import { ChagnePasswordRequestDto } from './dto/changePassword.dto'
import { response } from 'src/utils/response'

export type InquiryMemberByIdType = (
  memberId: number,
) => Promise<[Member, string]>

export type UpdatePasswordToMemberType = (
  member: Member,
  newPassword: string,
) => Promise<string>

@Injectable()
export class MemberService {
  changePasswordHandler(
    inquiryMemberById: Promise<InquiryMemberByIdType>,
    updatePasswordToMember: Promise<UpdatePasswordToMemberType>,
  ) {
    return async (body: ChagnePasswordRequestDto) => {
      const { memberId, newPassword } = body
      const [member, inquiryMemberByIdError] = await (await inquiryMemberById)(
        memberId,
      )

      if (inquiryMemberByIdError !== '') {
        return validateBadRequest(
          UnableInquiryMemberExistById,
          inquiryMemberByIdError,
        )
      }

      const updatePasswordToMemberError = await (await updatePasswordToMember)(
        member,
        newPassword,
      )
      if (updatePasswordToMemberError !== '') {
        return validateBadRequest(
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
