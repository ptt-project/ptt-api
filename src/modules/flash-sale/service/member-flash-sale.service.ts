import { Injectable } from '@nestjs/common'
import dayjs from 'dayjs'
import { PinoLogger } from 'nestjs-pino'
import { response } from 'src/utils/response'
import { UnableToGetFlashSaleForMemberError } from 'src/utils/response-code'
import { EntityManager, LessThanOrEqual, MoreThan, SelectQueryBuilder } from 'typeorm'
import { paginate } from 'nestjs-typeorm-paginate'
import { InquiryFlashSaleByRoundFuncType, InquiryCurrentFlashSaleRoundFuncType } from '../type/member-flash-sale.type'
import { GetMemberFlashSaleQueryDTO } from '../dto/member-flash-sale.dto'
import { FlashSaleProductProfile } from 'src/db/entities/FlashSaleProductProfile'
import { FlashSaleRound } from 'src/db/entities/FlashSaleRound'

@Injectable()
export class MemberFlashSaleService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(MemberFlashSaleService.name)
  }

  GetMemberFlashSaleHandler(
    inquiryCurrentFlashSaleRound: Promise<InquiryCurrentFlashSaleRoundFuncType>,
    inquiryCurrentFlashSale: Promise<InquiryFlashSaleByRoundFuncType>,
  ) {
    return async (query: GetMemberFlashSaleQueryDTO) => {
      const start = dayjs()

      const { limit = 10, page = 1 } = query
      
      const [currentRound, inquiryFlashSaleRoundError] = await (await inquiryCurrentFlashSaleRound)()

      if (inquiryFlashSaleRoundError != '') {
        return response(undefined, UnableToGetFlashSaleForMemberError, inquiryFlashSaleRoundError)
      }

      const [flashSaleQuery, inquiryFlashSaleError] = await (await inquiryCurrentFlashSale)(currentRound.id)

      if (inquiryFlashSaleError != '') {
        return response(undefined, UnableToGetFlashSaleForMemberError, inquiryFlashSaleError)
      }

      const result = await paginate<FlashSaleProductProfile>(flashSaleQuery, { limit, page })
      this.logger.info(`Done GetMemberFlashSaleHandler ${dayjs().diff(start)} ms`)
      return response({...result, currentRound})
    }
  }
  async InquiryCurrentFlashSaleRoundFunc(
    etm: EntityManager,
  ): Promise<InquiryCurrentFlashSaleRoundFuncType> {
    return async (): Promise<[FlashSaleRound, string]> => {
      const start = dayjs()
      
      let flashSaleRound: FlashSaleRound

      try {

        const now = new Date()
        flashSaleRound = await etm.findOne(FlashSaleRound, {
          where: {
            startTime: LessThanOrEqual(now),
            endTime: MoreThan(now),
          }
        })

        if (!flashSaleRound) {
          return [flashSaleRound, 'Not found any flash sale round']
        }

      } catch (error) {
        return [flashSaleRound, error.message]
      }
      
      this.logger.info(
        `Done InquiryCurrentFlashSaleRoundFunc ${dayjs().diff(start)} ms`,
      )
      return [flashSaleRound, '']
    }
  }

  async InquiryCurrentFlashSaleByRoundFunc(
    etm: EntityManager,
  ): Promise<InquiryFlashSaleByRoundFuncType> {
    return async (roundId: number): Promise<[SelectQueryBuilder<FlashSaleProductProfile>, string]> => {
      const start = dayjs()
      
      let flashSaleQuery: SelectQueryBuilder<FlashSaleProductProfile>

      try {
        flashSaleQuery = etm.createQueryBuilder(FlashSaleProductProfile, 'flashSaleProductProfile')
        flashSaleQuery
        .leftJoinAndSelect("flashSaleProductProfile.productProfile", "productProfile")
        .leftJoinAndSelect("flashSaleProductProfile.flashSale", "flashSale")
        const condition: any = { deletedAt: null, flashSale: {} }
        condition.flashSale.roundId = roundId
        condition.flashSale.status = 'active'
        condition.isActive = true
        flashSaleQuery.where(condition)

      } catch (error) {
        return [flashSaleQuery, error.message]
      }
      
      this.logger.info(
        `Done InquiryCurrentFlashSaleByRoundFunc ${dayjs().diff(start)} ms`,
      )
      return [flashSaleQuery, '']
    }
  }
}