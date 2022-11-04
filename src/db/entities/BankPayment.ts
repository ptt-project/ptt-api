import { Column, Entity, JoinColumn, OneToMany } from "typeorm";
import { AppEntity } from "./AppEntity";
import { Payment } from "./Payment";

@Entity({ name: 'bank_payment' })
export class BankPayment extends AppEntity {
  @Column({ name: 'name', nullable: false })
  name: string

  @Column({ name: 'account_number', nullable: false })
  accountNumber: string

  @OneToMany(
    () => Payment,
    payment => payment.bankPayment,
  )
  @JoinColumn({ referencedColumnName: 'bank_payment_id' })
  payment: Payment[]
}