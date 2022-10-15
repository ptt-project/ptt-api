import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm'
import { transformerDayjsToDate } from 'src/utils/entity-transform'

@Entity({ name: 'images' })
export class Image {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    nullable: false,
    transformer: transformerDayjsToDate,
  })
  createdAt: Date

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    nullable: false,
    transformer: transformerDayjsToDate,
  })
  updatedAt: Date

  @DeleteDateColumn({ name: 'deleted_at', transformer: transformerDayjsToDate })
  deletedAt: Date
}
