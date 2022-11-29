import { OrderShop } from 'src/db/entities/OrderShop'

export type AdjustWalletToSellerType = (
  orderShopList: OrderShop[],
  refId: string,
) => Promise<string>

export type AdjustWalletToBuyerParams = {
  walletId: string
  totalPrice: number
  code: string
}

export type AdjustWalletToBuyerType = (
  params: AdjustWalletToBuyerParams,
) => Promise<string>
