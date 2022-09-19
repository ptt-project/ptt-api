import { EntityManager } from 'typeorm'
import { Member } from 'src/db/entities/Member'
import { Mobile } from 'src/db/entities/Mobile'
import { addMobileRegisterDto, addMobileRequestDto } from './dto/mobile.dto'

export type AddMobileFuncType = (
  body: addMobileRequestDto | addMobileRegisterDto,
  member: Member,
) => Promise<string>

export type InquirySetMainMobileType = (
  mobile: Mobile,
  member: Member,
) => Promise<string>

export type InquiryDeleteMobileType = (
  mobile: Mobile,
  member: Member,
) => Promise<string>

export type InquiryGetMobileType = (
  mobile: string,
  member: Member,
) => Promise<[Mobile, string]>
