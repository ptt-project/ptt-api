import { Injectable } from '@nestjs/common'
import { Member } from 'src/db/entities/Member'
import { response } from 'src/utils/response'
import { UnableUpateProfileToDb } from 'src/utils/response-code'
import { EntityManager } from 'typeorm'
import { UpdateProfiledRequestDto } from './dto/updateProfile.dto'
import {
  getProfileType,
  UpdateProfileToDbParams,
  UpdateProfileToMemberType,
} from './member.type'

@Injectable()
export class MemberService {
  getProfileHandler(getProfile: Promise<getProfileType>) {
    return async (member: Member) => {
      const profile = await (await getProfile)(member)
      return response(profile)
    }
  }

  async getProfileFunc(): Promise<getProfileType> {
    return async (member: Member): Promise<any> => {
      return {
        username: member.username,
        firstname: member.firstname,
        lastname: member.lastname,
        mobile: member.mobile,
        birthday: member.birthday,
        gender: member.gender,
        email: member.email,
      }
    }
  }

  updateProfileHandler(
    updateProfileToMember: Promise<UpdateProfileToMemberType>,
  ) {
    return async (member: Member, body: UpdateProfiledRequestDto) => {
      const { id: memberId } = member

      const updateProfileToMemberError = await (await updateProfileToMember)(
        memberId,
        body,
      )

      if (updateProfileToMemberError !== '') {
        return response(
          undefined,
          UnableUpateProfileToDb,
          updateProfileToMemberError,
        )
      }

      return response(undefined)
    }
  }

  async updateProfileToMemberFunc(
    etm: EntityManager,
  ): Promise<UpdateProfileToMemberType> {
    return async (
      memberId: number,
      params: UpdateProfileToDbParams,
    ): Promise<string> => {
      try {
        await etm.getRepository(Member).update(memberId, { ...params })
      } catch (error) {
        return error
      }
      return ''
    }
  }
}
