import { Injectable } from "@nestjs/common";
import { Member } from 'src/db/entities/Member'
import { response } from "src/utils/response";

export type getProfileType = (
    member: Member,
  ) => Promise<any>

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
}