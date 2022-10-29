import { Column, Entity } from 'typeorm'
import { AppEntity } from './AppEntity'

export type MasterConfigType = {
  happyPointBuyRate: number
  happyPointSellRate: number
  happyPointTransferRate: number
  happyPointTransferPercentLimit: number
  happyPointFeePercent: number
  exchangeRate: number
}

@Entity({ name: 'master_config' })
export class MasterConfig extends AppEntity {
  @Column({
    name: 'config',
    type: 'simple-json',
    default: {},
    nullable: true,
  })
  config: MasterConfigType
}
