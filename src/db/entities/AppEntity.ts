import { transformerDayjsToDate } from 'src/utils/entity-transform'
import {
  BaseEntity,
  ObjectType,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  FindOneOptions,
} from 'typeorm'

export abstract class AppEntity extends BaseEntity {
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

  static async findOrInit<T extends AppEntity>(
    this: ObjectType<T>,
    data: FindOneOptions<T>,
  ): Promise<T> {
    let record = await (this as any).findOne(data)
    if (!record) {
      record = (this as any).create(data)
    }
    return record
  }
}
