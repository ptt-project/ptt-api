import { AppEntity } from './AppEntity'
import { Column, Entity, ManyToOne, JoinColumn, OneToMany } from 'typeorm'
import { Member } from './Member'
import { WalletTransaction } from './WalletTransaction'

@Entity({ name: 'bank_accounts' })
export class BankAccount extends AppEntity {
  @Column({ name: 'member_id', nullable: false })
  memberId: string

  @Column({ name: 'full_name', nullable: false })
  fullName: string

  @Column({ name: 'thai_id', nullable: false })
  thaiId: string

  @Column({ name: 'bank_code', nullable: false })
  bankCode: string

  @Column({ name: 'account_number', nullable: false })
  accountNumber: string

  @Column({ name: 'account_holder', nullable: false })
  accountHolder: string

  @Column({ name: 'is_main', nullable: false, default: false })
  isMain: boolean

  @ManyToOne(
    () => Member,
    member => member.bankAccounts,
  )
  @JoinColumn({ name: 'member_id', referencedColumnName: 'id' })
  member: Member

  @OneToMany(
    () => WalletTransaction,
    walletTransaction => walletTransaction.bankAccount,
  )
  transactions: WalletTransaction[]
}
