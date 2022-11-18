import { Column, Entity, } from "typeorm";
import { AppEntity } from "./AppEntity";


@Entity({ name: 'exchange_rate_transactions' })
export class ExchangeRateTransaction extends AppEntity {


  @Column({
    name: 'old_exchange_rate',
    type: 'decimal',
    precision: 12,
    scale: 4,
    default: 0,
    nullable: false,
  })
  oldExchangeRate: number

  @Column({
    name: 'new_exchange_rate',
    type: 'decimal',
    precision: 12,
    scale: 4,
    default: 0,
    nullable: false,
  })
  newExchangeRate: number

}