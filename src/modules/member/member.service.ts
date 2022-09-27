import { Injectable } from '@nestjs/common'
import dayjs from 'dayjs'
import { PinoLogger } from 'nestjs-pino'
import { Member } from 'src/db/entities/Member'
import { response } from 'src/utils/response'
import { UnableInquiryUserExistByMemberId, UnableUpateProfileToDb } from 'src/utils/response-code'
import { EntityManager } from 'typeorm'
import { UpdateProfiledRequestDto } from './dto/updateProfile.dto'
import {
  getProfileType,
  InquiryUserExistByMemberIdType,
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
        firstName: member.firstName,
        lastName: member.lastName,
        mobile: member.mobile,
        birthday: member.birthday,
        gender: member.gender,
        email: member.email,
        imageId: member.imageId,
      }
    }
  }

  updateProfileHandler(
    updateProfileToMember: Promise<UpdateProfileToMemberType>,
    inquiryUserExistByMemberId: Promise<InquiryUserExistByMemberIdType>,
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

      const [memberResult, inquiryUserExistByMemberIdError] = await (await inquiryUserExistByMemberId)(
        memberId,
      )

      if (inquiryUserExistByMemberIdError !== '') {
        return response(
          undefined,
          UnableInquiryUserExistByMemberId,
          inquiryUserExistByMemberIdError,
        )
      }

      this.logger.info(`Done UpdateProfileHandler ${dayjs().diff(start)} ms`)
      return response({
        username: memberResult.username,
        firstName: memberResult.firstName,
        lastName: memberResult.lastName,
        mobile: memberResult.mobile,
        birthday: memberResult.birthday,
        gender: memberResult.gender,
        email: memberResult.email,
        imageId: memberResult.imageId,
      })
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
        await etm.update(Member, memberId, { ...params })
      } catch (error) {
        return error
      }

      this.logger.info(
        `Done UpdateProfileToMemberFunc ${dayjs().diff(start)} ms`,
      )
      return ''
    }
  }

  async InquiryUserExistByMemberIdFunc(
    etm: EntityManager,
  ): Promise<InquiryUserExistByMemberIdType> {
    return async (id: number): Promise<[Member, string]> => {
      const start = dayjs()
      let member: Member
      try {
        member = await etm.findOne(Member, {
          where: [
            {
              id,
            },
          ],
        })
        if (!member) {
          return [null, 'Username is not already used']
        }
      } catch (error) {
        return [null, error]
      }

      this.logger.info(
        `Done InquiryUserExistByMemberIdFunc ${dayjs().diff(start)} ms`,
      )
      return [member, '']
    }
  }
}
