import { Column, Entity } from 'typeorm'
import { AppEntity } from './AppEntity'

export type StatusType = 'send' | 'verified'
@Entity({ name: 'otps' })
export class Otp extends AppEntity {
  @Column({ name: 'reference', nullable: false })
  reference: string

  @Column({ name: 'ref_code', nullable: false, length: 4 })
  refCode: string

  @Column({ name: 'otp_code', nullable: false, length: 6 })
  otpCode: string

  @Column({ name: 'verify_count', nullable: false, default: 0 })
  verifyCount: number

  @Column({ name: 'type', nullable: true })
  type: string

  @Column({
    name: 'status',
    type: 'enum',
    enum: ['send', 'verified'],
    default: 'send',
    nullable: false,
  })
  status: StatusType
}
