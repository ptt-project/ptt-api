import { Address } from "@nestjs-modules/mailer/dist/interfaces/send-mail-options.interface"
import { Order } from "src/db/entities/Order"
import { OrderShop } from "src/db/entities/OrderShop"
import { OrderShopProduct } from "src/db/entities/OrderShopProduct"
import { Payment } from "src/db/entities/Payment"
import { Product } from "src/db/entities/Product"
import { ProductProfile } from "src/db/entities/ProductProfile"
import { Shop } from "src/db/entities/Shop"
import { CreateOrderDto, OrderShopDto, OrderShopProductDto } from "../dto/createOrder.dto"

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

export type InquiryShopByIdType = (
  shopId: string,
) => Promise<[Shop, string]>

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
  orderId: string,
  params: OrderShopProductDto,
  productProfile: ProductProfile
) => Promise<[OrderShopProduct, string]>

export type UpdateStockToProductType = (
  productId: string,
  stock: number,
  sold: number
) => Promise<string>
