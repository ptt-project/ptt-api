import { FlashSaleProductProfile } from 'src/db/entities/FlashSaleProductProfile'
import { FlashSaleRound } from 'src/db/entities/FlashSaleRound'
import { SelectQueryBuilder } from 'typeorm'

export type InquiryFlashSaleByRoundFuncType = (
    roundId: number,
) => Promise<[SelectQueryBuilder<FlashSaleProductProfile>, string]>

export type InquiryCurrentFlashSaleRoundFuncType = (
) => Promise<[FlashSaleRound, string]>