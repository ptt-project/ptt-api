import { Column, Entity } from 'typeorm'
import { AppEntity } from './AppEntity'

@Entity({ name: 'brands' })
export class BrandId extends AppEntity {
  @Column({ name: 'name', nullable: false })
  name: string
}
