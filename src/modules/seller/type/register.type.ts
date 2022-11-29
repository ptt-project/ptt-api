import { Shop } from "src/db/entities/Shop"

export type CreateTablePartitionOfProductProfileToDbType = (
  id: string,
) => Promise<string>

export type UpdateShopWalletFuncType = (
  shop: Shop,
  walletId: string,
) => Promise<[Shop, string]>