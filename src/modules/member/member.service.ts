import { Injectable } from "@nestjs/common";
import { Member } from 'src/db/entities/Member'
import { response } from "src/utils/response";
import { UnableUpateProfileToDb } from "src/utils/response-code";
import { UpdateProfiledRequestDto } from "./dto/updateProfile.dto";
import { getProfileType, UpdateProfileToMemberType } from "./type/member.type";

@Injectable()
export class MemberService {

  getProfileHandler (
    getProfile: Promise<getProfileType>,
  ) {
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

  updateProfileHandler (
    updateProfileToMember: Promise<UpdateProfileToMemberType>,
  ) {
      return async (member: Member,body: UpdateProfiledRequestDto) => {
        const updateProfileToMemberError = await (await updateProfileToMember)(
          member,
          body,
        )
        if (updateProfileToMemberError !== '') {
          return response(
            UnableUpateProfileToDb,
            updateProfileToMemberError,
          )
        }
  
        return response(undefined)
      }
  }

  async updateProfileToMemberFunc(): Promise<UpdateProfileToMemberType> {
    return async (member: Member, body: UpdateProfiledRequestDto): Promise<string> => {
      
      try {
        member.firstname = body.firstName
        member.lastname = body.lastName
        member.birthday = body.birthday
        member.gender = body.gender

        await member.save()
      } catch (error) {
        return error
      }
      return ''
    }
  }
}