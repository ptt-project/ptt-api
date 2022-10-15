import { FlashSaleProduct } from 'src/db/entities/FlashSaleProduct'
import { FlashSaleRound } from 'src/db/entities/FlashSaleRound'
import { SelectQueryBuilder } from 'typeorm'

export type InquiryFlashSaleByRoundFuncType = (
    roundId: number,
) => Promise<[SelectQueryBuilder<FlashSaleProduct>, string]>

export type InquiryCurrentFlashSaleRoundFuncType = (
) => Promise<[FlashSaleRound, string]>