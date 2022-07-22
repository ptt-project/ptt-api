import { Column, Entity } from 'typeorm'
import { AppEntity } from './AppEntity'

@Entity({ name: 'brands' })
export class Brand extends AppEntity {
  @Column({ name: 'name', nullable: false })
  name: string
}
