import { Column, Entity } from 'typeorm'
import { AppEntity } from './AppEntity'

@Entity({ name: 'address_masters' })
export class AddressMaster extends AppEntity {
  @Column({ name: 'data', type: 'simple-json', nullable: false })
  data: Array<any>
}
