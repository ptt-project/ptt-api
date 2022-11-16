import { Column, Entity } from 'typeorm'
import { AppEntity } from './AppEntity'

@Entity({ name: 'brands' })
export class Brand extends AppEntity {
  @Column({ name: 'name_th', nullable: false })
  nameTh: string

  @Column({ name: 'name_en', nullable: false })
  nameEn: string
}
