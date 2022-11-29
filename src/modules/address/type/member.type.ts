import { Address } from 'src/db/entities/Address'
import { MemberRoleType } from 'src/db/entities/Member'

export type InsertAddressToDbParams = {
  memberId: string
  name: string
  mobile: string
  province: string
  tambon: string
  district: string
  postcode: string
  address?: string
  geoName?: GeoNameType
  isMain?: boolean
  isHome?: boolean
  isWork?: boolean
}

export type UpdateAddressToDbParams = {
  memberId: string
  name: string
  mobile: string
  province: string
  tambon: string
  district: string
  postcode: string
  address?: string
  geoName?: GeoNameType
  isMain?: boolean
  isHome?: boolean
  isWork?: boolean
}

export type GeoNameType = {
  lat?: number
  lng?: number
}

export type InsertAddressToDbType = (
  params: InsertAddressToDbParams,
) => Promise<[Address, string]>

export type UpdateNotMainAddressesByMemberIdType = (
  memberId: string,
) => Promise<string>

export type UpdateAddressByIdType = (
  addressId: string,
  params: UpdateAddressToDbParams,
) => Promise<string>

export type DeleteAddressByIdInDbType = (
  address: Address,
  role: MemberRoleType,
) => Promise<string>

export type UpdateIsMainAddressesByIdToDbType = (
  addressId: string,
) => Promise<string>

export type InquiryAddressByIdType = (
  addressId: string,
) => Promise<[Address, string]>

export type InquiryAddressesByMemberIdType = (
  memberId: string,
) => Promise<[Address[], string]>

export type UpdateNotPickupAddressesByMemberIdType = (
  memberId: string,
  role: MemberRoleType,
) => Promise<string>

export type UpdateNotReturnItemAddressesByMemberIdType = (
  memberId: string,
  role: MemberRoleType,
) => Promise<string>

export type InquirySellerAddressesByShopIdsType = (
  shopIds: string[],
) => Promise<[Address[], string]>