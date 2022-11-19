import { Address } from 'src/db/entities/Address'
import { Member } from 'src/db/entities/Member'
import { Product } from 'src/db/entities/Product'
import { ProductProfile } from 'src/db/entities/ProductProfile'
import { ShippopGetPriceDetail } from 'src/modules/order/type/order.type'
import { SelectQueryBuilder } from 'typeorm'
import { GetProductInfoMemberDto, GetProductListMemberDto, ShopShipping } from '../dto/getProductList.dto'

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
  shopId: string,
  query: GetProductListMemberDto,
) => Promise<[SelectQueryBuilder<ProductProfile>, string]>

export type InquiryProductInfoByProductIdsType = (
  query: GetProductInfoMemberDto,
) => Promise<[Product[], string]>

export type InquiryMemberProductCurrentPriceFuncType = (
  member: Member,
  products: Product[],
)=> Promise<[Record<number, ProductPrice>, string]>

export type ShippingPrice = Record<string, ShippopGetPriceDetail[]>

export type RequestProductShippingPriceFuncType = (
  shops: ShopShipping[],
  products: Product[],
  buyerAddress: Address,
  sellerAddresses: Address[]
) => Promise<[ShippingPrice, string]>