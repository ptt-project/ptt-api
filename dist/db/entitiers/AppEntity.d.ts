import { BaseEntity, ObjectType, FindOneOptions } from 'typeorm';
export declare abstract class AppEntity extends BaseEntity {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
    static findOrInit<T extends AppEntity>(this: ObjectType<T>, data: FindOneOptions<T>): Promise<T>;
}
