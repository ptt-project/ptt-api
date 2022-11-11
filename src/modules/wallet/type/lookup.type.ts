export type Lookup = {
  refId: string
  walletId: string
  eWalletWithdrawFeeRate: number
}

export type SetCacheLookupToRedisFunc = (body: Lookup) => Promise<string>

export type GetCacheLookupToRedisType = (
  refId: string,
) => Promise<[Lookup, string]>

export type InsertLookupToDbParams = {
  happyPointId: string
  exchangeRate: number
}

export type InsertLookupToDbType = (
  params: InsertLookupToDbParams,
) => Promise<[Lookup, string]>
