import { AppEntity } from './AppEntity'
import { Column, Entity, ManyToOne, JoinColumn, OneToMany } from 'typeorm'
import { Member } from './Member'
import { WalletTransaction } from './WalletTransaction'

@Entity({ name: 'wallets' })
export class Wallet extends AppEntity {
  @Column({ name: 'member_id', nullable: false })
  memberId: number

  @Column({
    name: 'balance',
    nullable: false,
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  balance: number

  @ManyToOne(
    () => Member,
    member => member.wallets,
  )
  @JoinColumn({ name: 'member_id', referencedColumnName: 'id' })
  member: Member

  @OneToMany(
    () => WalletTransaction,
    WalletTransaction => WalletTransaction.wallet,
  )
  transactions: WalletTransaction
}
