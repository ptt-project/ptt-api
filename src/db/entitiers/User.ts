import { Column, Entity } from 'typeorm';
import { AppEntity } from './AppEntity';

@Entity({ name: 'users' })
export class User extends AppEntity {
  @Column({ name: 'first_name', nullable: true })
  firstName: string;

  @Column({ name: 'last_name_th', nullable: true })
  lastName: string;
}
