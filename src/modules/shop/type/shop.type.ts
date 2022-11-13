import { MallApplicantRoleType, Shop, ShopType } from 'src/db/entities/Shop'
import { Condition } from "src/db/entities/Condition";
import { UpdateShopInfoRequestDto } from '../dto/shop.dto'

export type InsertShopToDbParams = {
  type: ShopType
  memberId: string
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
  mallApplicantRole?: MallApplicantRoleType
  mallOfflineShopDetail?: string
  mallShopDescription?: string
}

export type UpdateShopToDbParams = {
  memberId: string
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
  mallApplicantRole?: MallApplicantRoleType
  mallOfflineShopDetail?: string
  mallShopDescription?: string
}

export type UpdateShopInfoToDbParams = {
  shopName: string
  shopDescription: string
}

export type InsertShopToDbType = (
  params: InsertShopToDbParams,
) => Promise<[Shop, string]>

export type GetShopInfoType = (memberId: string) => Promise<[Shop, string]>

export type UpdateShopTobDbByIdType = (
  memberId: string,
  params: UpdateShopInfoRequestDto,
) => Promise<string>

