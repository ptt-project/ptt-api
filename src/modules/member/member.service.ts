import { Injectable } from '@nestjs/common'
import dayjs from 'dayjs'
import { PinoLogger } from 'nestjs-pino'
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
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(MemberService.name)
  }

  getProfileHandler(getProfile: Promise<getProfileType>) {
    return async (member: Member) => {
      const start = dayjs()
      const profile = await (await getProfile)(member)

      this.logger.info(`Done GetProfileHandler ${dayjs().diff(start)} ms`)
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
      const start = dayjs()
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

      this.logger.info(`Done UpdateProfileHandler ${dayjs().diff(start)} ms`)
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
      const start = dayjs()
      try {
        await etm.getRepository(Member).update(memberId, { ...params })
      } catch (error) {
        return error
      }

      this.logger.info(
        `Done UpdateProfileToMemberFunc ${dayjs().diff(start)} ms`,
      )
      return ''
    }
  }
}
