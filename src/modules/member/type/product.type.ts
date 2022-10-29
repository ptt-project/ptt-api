import { Member } from 'src/db/entities/Member'
import { Product } from 'src/db/entities/Product'
import { ProductProfile } from 'src/db/entities/ProductProfile'
import { SelectQueryBuilder } from 'typeorm'
import { GetProductInfoMemberDto, GetProductListMemberDto } from '../dto/getProductList.dto'

export type ProductPrice = {
  productId: number,
  shopId?: number,
  shopName?: string,
  productName?: string,
  imageIds?: number[],
  option1?: string,
  option2?: string,
  price?: number,
  stock?: number,
  status: 'available' | 'unavailable' | 'not found',
}

export type InquiryProductListByShopIdType = (
  shopId: number,
  query: GetProductListMemberDto,
) => Promise<[SelectQueryBuilder<ProductProfile>, string]>

export type InquiryProductInfoByProductIdsType = (
  query: GetProductInfoMemberDto,
) => Promise<[Product[], string]>

export type InquiryMemberProductCurrentPriceFuncType = (
  member: Member,
  products: Product[],
)=> Promise<[Record<number, ProductPrice>, string]>