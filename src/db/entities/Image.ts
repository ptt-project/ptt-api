import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Column,
} from 'typeorm'
import { transformerDayjsToDate } from 'src/utils/entity-transform'

@Entity({ name: 'images' })
export class Image {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'large_url', nullable: true })
  largeUrl: string

  @Column({ name: 'medium_url', nullable: true })
  mediumUrl: string

  @Column({ name: 'small_url', nullable: true })
  smallUrl: string

  @Column({ name: 'thumnail_url', nullable: true })
  thumnailUrl: string

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
