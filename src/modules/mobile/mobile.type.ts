import { EntityManager } from 'typeorm'
import { Member } from 'src/db/entities/Member'
import { Mobile } from 'src/db/entities/Mobile'
import { addMobileRegisterDto, addMobileRequestDto } from './dto/mobile.dto'

export type InquiryAddMobileType = (
  body: addMobileRequestDto | addMobileRegisterDto,
  member: Member,
  manager: EntityManager,
) => Promise<string>

export type InquirySetMainMobileType = (
  mobile: Mobile,
  member: Member,
  manager: EntityManager,
) => Promise<string>

export type InquiryDeleteMobileType = (
  mobile: Mobile,
  member: Member,
  manager: EntityManager,
) => Promise<string>

export type InquiryGetMobileType = (
  mobile: string,
  member: Member,
  manager: EntityManager,
) => Promise<[Mobile, string]>
