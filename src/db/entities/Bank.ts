import { Column, Entity } from 'typeorm'
import { AppEntity } from './AppEntity'

@Entity({ name: 'banks' })
export class Bank extends AppEntity {
  @Column({ name: 'bank_code', nullable: false, unique: true })
  bankCode: string

  @Column({ name: 'name_th', nullable: false })
  nameTh: string

  @Column({ name: 'name_en', nullable: false })
  nameEn: string
}
