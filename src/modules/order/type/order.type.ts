import { Order } from 'src/db/entities/Order'
import { OrderShop } from 'src/db/entities/OrderShop'
import { OrderShopProduct } from 'src/db/entities/OrderShopProduct'
import { Payment } from 'src/db/entities/Payment'
import { Product } from 'src/db/entities/Product'
import { ProductProfile } from 'src/db/entities/ProductProfile'
import { Shop } from 'src/db/entities/Shop'
import { SelectQueryBuilder } from 'typeorm'
import {
  CreateOrderDto,
  OrderShopDto,
  OrderShopProductDto,
} from '../dto/createOrder.dto'

export type ShippopGetPriceDetail = {
  courierCode: string
  price: string
  estimateTime: string
  available: boolean
  remark: string
  errCode: string
  courierName: string
  priceFuelSurcharge?: number
}

export type ShippopGetPriceResponse = {
  status: boolean
  data: ShippopGetPriceDetail
}

export type AddressToShippop = {
  name: string
  mobile: string
  province: string
  tambon: string
  district: string
  postcode: string
  address: string
  lat?: number
  lng?: number
}

export type ProductForShippopGetPrice = {
  name: string
  weight: number
  width: number
  length: number
  height: number
}

export type InquiryPriceFromShippopType = (
  fromAddress: AddressToShippop,
  toAddress: AddressToShippop,
  products: ProductForShippopGetPrice[],
) => Promise<ShippopGetPriceDetail[]>

export type InsertOrderToDbType = (
  memberId: string,
  createOrderParams: CreateOrderDto,
) => Promise<[Order, string]>

export type InsertPaymentByBankToDbType = (
  orderId: string,
  createOrderParams: CreateOrderDto,
) => Promise<[Payment, string]>

export type InsertPaymentByHappyToDbType = (
  orderId: string,
  happyPointTransactionId: string,
  createOrderParams: CreateOrderDto,
) => Promise<[Payment, string]>

export type InsertPaymentByEwalletToDbType = (
  orderId: string,
  walletTransactionId: string,
  createOrderParams: CreateOrderDto,
) => Promise<[Payment, string]>

export type UpdatePaymentIdToOrderType = (
  orderId: string,
  paymentId?: string,
) => Promise<string>

export type InquiryShopByIdType = (shopId: string) => Promise<[Shop, string]>

export type InsertOrderShopToDbType = (
  orderId: string,
  params: OrderShopDto,
) => Promise<[OrderShop, string]>

export type InquiryProductByIdType = (
  productId: string,
) => Promise<[Product, string]>

export type InquiryProducProfiletByIdType = (
  productProfileId: string,
) => Promise<[ProductProfile, string]>

export type InsertOrderShopProductToDbType = (
  orderShopId: string,
  params: OrderShopProductDto,
  productProfile: ProductProfile,
) => Promise<[OrderShopProduct, string]>

export type UpdateStockToProductType = (
  productId: string,
  stock: number,
  sold: number,
  amountSold: number,
) => Promise<string>

export type ValidateOrderParamsType = (
  params: CreateOrderDto,
) => Promise<string>

export type InsertOrderShopProductType = (
  orderShopId: string,
  params: OrderShopProductDto,
) => Promise<[OrderShopProduct, string]>

export type AdjustWalletToSellerType = (
  orderShopList: OrderShop[],
  refId: string,
) => Promise<string>

export type InquiryOrderShopByIdFuncType = (
  memberId: string,
  orderShopId: string,
) => Promise<[OrderShop, string]>

export type InquiryOrderShopsFuncType = (
  memberId: string,
  keyword?: string,
  status?: string,
) => Promise<[SelectQueryBuilder<OrderShop>, string]>
