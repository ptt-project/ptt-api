import { AppEntity } from './AppEntity'
import { Column, Entity } from 'typeorm'
import { StatusType } from './Category'

@Entity({ name: 'platform_categories' })
export class PlatformCategory extends AppEntity {
  @Column({ name: 'name', nullable: false, length: 40 })
  name: string

  @Column({
    name: 'status',
    type: 'enum',
    enum: ['active', 'inactive'],
    default: 'inactive',
    nullable: false,
  })
  status: StatusType
}
