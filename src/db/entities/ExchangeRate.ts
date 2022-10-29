import { Column, Entity, } from "typeorm";
import { AppEntity } from "./AppEntity";


@Entity({ name: 'exchange_rates' })
export class ExchangeRate extends AppEntity {

  @Column({
    name: 'exchange_rate',
    type: 'decimal',
    precision: 12,
    scale: 4,
    default: 0,
    nullable: false,
  })
  exchangeRate: number

}