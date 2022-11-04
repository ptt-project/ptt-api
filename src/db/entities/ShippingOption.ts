import { Column, Entity, JoinColumn, OneToMany } from "typeorm";
import { AppEntity } from "./AppEntity";
import { OrderShop } from "./OrderShop";

@Entity({ name: 'shipping_option' })
export class ShippingOption extends AppEntity {
  @Column({ name: 'name', nullable: false })
  name: string

  @OneToMany(
    () => OrderShop,
    orderShop => orderShop.shippingOption,
  )
  @JoinColumn({ referencedColumnName: 'shipping_option_id' })
  orderShop: OrderShop[]
}