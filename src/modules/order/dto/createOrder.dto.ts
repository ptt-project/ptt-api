import {
  IsArray,
  IsIn,
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator'
import { PaymentType } from 'src/db/entities/Payment'

export class GetOrderRequestDto {
  @IsOptional()
  @IsNumber()
  limit?: number

  @IsOptional()
  @IsNumber()
  page?: number

  @IsOptional()
  @IsString()
  keyword?: string

  @IsOptional()
  @IsString()
  @IsIn([
    'toPay',
    'toShip',
    'toReceive',
    'complated',
    'cancelled',
    'return',
    'refund',
  ])
  status?: string
}

export class CreateOrderDto {
  @IsOptional()
  happyVoucherId?: string

  @IsString()
  @IsNotEmpty()
  paymentType: PaymentType

  @IsOptional()
  bankPaymentId?: string

  @IsOptional()
  qrCode?: string

  @IsOptional()
  reference?: string

  @IsOptional()
  point?: number

  @IsOptional()
  totalAmount?: number

  @IsOptional()
  feeAmount?: number

  @IsOptional()
  amountSell?: number

  @IsOptional()
  refId?: string

  @IsOptional()
  otpCode?: string

  @IsOptional()
  refCode?: string

  @IsNumber()
  @IsNotEmpty()
  merchandiseSubtotal: number

  @IsNumber()
  @IsNotEmpty()
  shippingTotal: number

  @IsOptional()
  discount?: number

  @IsNumber()
  @IsNotEmpty()
  amount: number

  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsNotEmpty()
  address: string

  @IsString()
  @IsNotEmpty()
  tambon: string

  @IsString()
  @IsNotEmpty()
  district: string

  @IsString()
  @IsNotEmpty()
  province: string

  @IsString()
  @IsNotEmpty()
  postcode: string

  @IsString()
  @IsNotEmpty()
  mobile: string

  @IsArray()
  @IsNotEmpty()
  orderShop: OrderShopDto[]
}

export class OrderShopDto {
  @IsNumber()
  @IsNotEmpty()
  shopId: string

  @IsOptional()
  shopVoucherId?: string

  @IsNumber()
  @IsNotEmpty()
  orderShopAmount: number

  @IsNumber()
  @IsNotEmpty()
  shippingOptionId: string

  @IsNumber()
  @IsNotEmpty()
  shippingPrice: number

  @IsNotEmpty()
  @IsISO8601()
  minDeliverDate: Date

  @IsNotEmpty()
  @IsISO8601()
  maxDeliverDate: Date

  @IsOptional()
  note?: string

  @IsArray()
  @IsNotEmpty()
  orderShopProduct: OrderShopProductDto[]
}

export class OrderShopProductDto {
  @IsNumber()
  @IsNotEmpty()
  productId: string

  @IsString()
  @IsNotEmpty()
  productProfileName: string

  @IsOptional()
  productProfileImage?: string

  @IsOptional()
  productOptions1?: string

  @IsOptional()
  productOptions2?: string

  @IsNumber()
  @IsNotEmpty()
  unitPrice: number

  @IsNumber()
  @IsNotEmpty()
  units: number
}
