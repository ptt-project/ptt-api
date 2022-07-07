import { Address } from 'src/db/entities/Address'

export type InsertAddressToDbParams = {
  memberId: number
  name: string
  mobile: string
  province: string
  tambon: string
  district: string
  postcode: string
  address?: string
  geoName?: string
  isMain?: boolean
  isHome?: boolean
  isWork?: boolean
}

export type UpdateAddressToDbParams = {
  memberId: number
  name: string
  mobile: string
  province: string
  tambon: string
  district: string
  postcode: string
  address?: string
  geoName?: string
  isMain?: boolean
  isHome?: boolean
  isWork?: boolean
}

export type InsertAddressToDbType = (
  params: InsertAddressToDbParams,
) => Promise<[Address, string]>

export type UpdateNotMainAddressesByMemberIdType = (
  memberId: number,
) => Promise<string>

export type UpdateAddressByIdType = (
  addressId: number,
  params: UpdateAddressToDbParams,
) => Promise<string>

export type DeleteAddressByIdInDbType = (address: Address) => Promise<string>

export type UpdateIsMainAddressesByIdToDbType = (
  addressId: number,
) => Promise<string>

export type InquiryAddressByIdType = (
  addressId: number,
) => Promise<[Address, string]>

export type InquiryAddressesByMemberIdType = (
  memberId: number,
) => Promise<[Address[], string]>