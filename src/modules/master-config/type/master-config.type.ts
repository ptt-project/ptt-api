import { MasterConfig } from 'src/db/entities/MasterConfig'

export type InquiryMasterConfigType = () => Promise<[MasterConfig, string]>
