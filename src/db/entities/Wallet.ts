import { AppEntity } from './AppEntity'
import { Column, Entity, ManyToOne, JoinColumn, OneToMany, OneToOne } from 'typeorm'
import { Member } from './Member'
import { WalletTransaction } from './WalletTransaction'
import { transformerDecimalToNumber } from 'src/utils/entity-transform'
import { Shop } from './Shop'

@Entity({ name: 'wallets' })
export class Wallet extends AppEntity {
  @Column({ name: 'member_id', nullable: false })
  memberId: string

  @Column({ name: 'shop_id', nullable: true })
  shopId: string

  @Column({
    name: 'balance',
    nullable: false,
    type: 'decimal',
    precision: 14,
    scale: 4,
    default: 0,
    transformer: transformerDecimalToNumber,
  })
  balance: number

  @ManyToOne(
    () => Member,
    member => member.wallets,
  )
  @JoinColumn({ name: 'member_id', referencedColumnName: 'id' })
  member: Member

  @OneToOne(
    () => Shop,
    shop => shop.wallet,
  )
  @JoinColumn({ name: 'shop_id', referencedColumnName: 'id' })
  shop: Shop

  @OneToMany(
    () => WalletTransaction,
    WalletTransaction => WalletTransaction.wallet,
  )
  transactions: WalletTransaction
}
