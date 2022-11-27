import { MallApplicantRoleType, Shop, ShopType } from 'src/db/entities/Shop'
import { Condition } from "src/db/entities/Condition";
import { UpdateShopInfoRequestDto } from '../dto/shop.dto'
import { SelectQueryBuilder } from 'typeorm';
import { IPaginationMeta, Pagination } from 'nestjs-typeorm-paginate';

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
  corporateId?: string
  corporateName?: string
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
  corporateId?: string
  corporateName?: string
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

export type PreInquiryShopBySearchKeywordFromDbFuncType = (
  keyword: string,
) => [SelectQueryBuilder<Shop>, string]

export type ExecutePreInquiryShopFromDbType = (
  shopQuery: SelectQueryBuilder<Shop>,
  limit: number,
  page: number,
) => Promise<[Pagination<Shop, IPaginationMeta>, string]>

export type SearchShopResponseType = {
  shopName: string,
  productCount: number,
  shopScore: number,
  replyRate: number,
  profileImagePath: string,
  replyTime: number,
  following: number,
  follower: number,
}

export type ConvertDataToShopSearchPageFuncType = (
  paginateProductProfile: Pagination<Shop, IPaginationMeta>,
) => [Pagination<SearchShopResponseType, IPaginationMeta>, string]