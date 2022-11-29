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
  @IsIn(['BANK', 'HAPPYPOINT', 'EWALLET', 'CASHONDELIVERY'])
  @IsNotEmpty()
  paymentType: PaymentType

  @IsOptional()
  qrCode?: string

  @IsOptional()
  reference?: string

  @IsOptional()
  amountOfHappyPoint?: number

  @IsOptional()
  refId?: string

  @IsOptional()
  otpCode?: string

  @IsOptional()
  refCode?: string

  @IsNumber()
  @IsNotEmpty()
  totalPriceOfProducts: number

  @IsNumber()
  @IsNotEmpty()
  totalPriceOfShippings: number

  @IsOptional()
  discount?: number

  @IsNumber()
  @IsNotEmpty()
  totalPrice: number

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
  totalPrice: number

  @IsNumber()
  @IsNotEmpty()
  totalPriceOfProducts: number

  @IsNumber()
  @IsNotEmpty()
  shippingOptionId?: string

  @IsNumber()
  @IsNotEmpty()
  totalPriceOfShippings: number

  @IsNotEmpty()
  @IsISO8601()
  minDeliverDate: Date

  @IsOptional()
  discount?: number

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
