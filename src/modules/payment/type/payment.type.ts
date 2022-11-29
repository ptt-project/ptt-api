import {
  Payment,
  PaymentType,
  PaymentStatusType,
} from 'src/db/entities/Payment'

export type InsertPaymentParams = {
  orderId: string
  status: PaymentStatusType
  paymentableId: string
  paymentableType: PaymentType
  qrCode?: string
  reference?: string
}

export type InsertPaymentToDbType = (
  params: InsertPaymentParams,
) => Promise<[Payment, string]>
