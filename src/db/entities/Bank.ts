import { Column, Entity } from 'typeorm'
import { AppEntity } from './AppEntity'

@Entity({ name: 'banks' })
export class Bank extends AppEntity {
  @Column({ name: 'bank_code', nullable: false, unique: true })
  bankCode: string

  @Column({ name: 'name', nullable: false })
  name: string
}
