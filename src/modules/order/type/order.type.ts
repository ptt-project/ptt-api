import { Order, OrderStatusType } from 'src/db/entities/Order'
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

export type InsertOrderToDbType = (
  memberId: string,
  createOrderParams: CreateOrderDto,
) => Promise<[Order, string]>

export type InsertPaymentByBankToDbType = (
  orderId: string,
  createOrderParams: CreateOrderDto,
) => Promise<[Payment, string]>

export type UpdatePaymentIdAndStatusToOrderType = (
  orderId: string,
  paymentId: string,
  status: OrderStatusType,
) => Promise<string>

export type InquiryShopByIdType = (shopId: string) => Promise<[Shop, string]>

export type InsertOrderShopToDbType = (
  orderId: string,
  params: OrderShopDto,
) => Promise<[OrderShop, string]>

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

export type InquiryOrderShopByIdFuncType = (
  memberId: string,
  orderShopId: string,
) => Promise<[OrderShop, string]>

export type InquiryOrderShopsFuncType = (
  memberId: string,
  keyword?: string,
  status?: string,
) => Promise<[SelectQueryBuilder<OrderShop>, string]>

export type CreateOrderToDbType = (
  memberId: string,
  body: CreateOrderDto,
) => Promise<[Order, OrderShop[], number, string]>
