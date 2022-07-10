import { Address } from 'src/db/entities/Address'
import { Shop, ShopType } from 'src/db/entities/Shop'
import { RegisterSellerRequestDto } from './dto/seller.dto'

export type InsertShopToDbParams = {
  type: ShopType
  memberId: number
  fullName: string
  mobile: string
  email: string
  brandName: string
  category: string
  website?: string
  facebookPage?: string
  instagram?: string
  socialMedia?: string
  note?: string
  corperateId?: string
  corperateName?: string
}

export type UpdateShopToDbParams = {
  memberId: number
  fullName: string
  mobile: string
  email: string
  brandName: string
  category: string
  website?: string
  facebookPage?: string
  instagram?: string
  socialMedia?: string
  note?: string
  corperateId?: string
  corperateName?: string
}

export type InsertShopToDbType = (
  params: InsertShopToDbParams,
) => Promise<[Shop, string]>

export type ValidateSellerRegisterType = (
  memberId: number,
  params: RegisterSellerRequestDto,
  isResubmit: boolean,
) => Promise<string>

export type UpdateShopByIdType = (
  shopId: number,
  params: UpdateShopToDbParams,
) => Promise<string>

export type DeleteAddressByIdInDbType = (address: Address) => Promise<string>

export type UpdateIsMainAddressesByIdToDbType = (
  addressId: number,
) => Promise<string>

export type InquiryAddressByIdType = (
  addressId: number,
) => Promise<[Address, string]>

export type InquiryShopByMemberIdType = (
  memberId: number,
) => Promise<[Shop, string]>
