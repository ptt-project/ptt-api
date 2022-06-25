import { Column, Entity, OneToOne, JoinColumn } from 'typeorm'
import { AppEntity } from './AppEntity'
import { Member } from './Member'

export type StatusType = "send" | "verified"
@Entity({ name: 'otps' })
export class Otp extends AppEntity {
  @Column({ name: 'mobile', nullable: false, length: 20 })
  mobile: string

  @Column({ name: 'ref_code', nullable: false, length: 4 })
  refCode: string

  @Column({ name: 'otp_code', nullable: false, length: 6 })
  otpCode: string

  @Column({ name: 'verify_count', nullable: false, default: 0 })
  verifyCount: number

  @Column({ name: 'detail', nullable: true })
  detail: string

  @OneToOne(() => Member)
  @JoinColumn()
  customer: Member

  @Column({ 
    name: 'status',
    type: "enum",
    enum: ["send", "verified"],
    default: "send",
    nullable: false })
  status: StatusType
}
