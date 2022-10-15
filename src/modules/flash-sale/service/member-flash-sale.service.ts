import { Injectable } from '@nestjs/common'
import dayjs from 'dayjs'
import { PinoLogger } from 'nestjs-pino'
import { response } from 'src/utils/response'
import { UnableToGetFlashSaleForMemberError } from 'src/utils/response-code'
import { EntityManager, LessThan, LessThanOrEqual, MoreThan, SelectQueryBuilder } from 'typeorm'
import { paginate } from 'nestjs-typeorm-paginate'
import { InquiryFlashSaleByRoundFuncType, InquiryCurrentFlashSaleRoundFuncType } from '../type/member-flash-sale.type'
import { GetMemberFlashSaleQueryDTO } from '../dto/member-flash-sale.dto'
import { FlashSaleProduct } from 'src/db/entities/FlashSaleProduct'
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

      const result = await paginate<FlashSaleProduct>(flashSaleQuery, { limit, page })
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
    return async (roundId: number): Promise<[SelectQueryBuilder<FlashSaleProduct>, string]> => {
      const start = dayjs()
      
      let flashSaleQuery: SelectQueryBuilder<FlashSaleProduct>

      try {
        flashSaleQuery = etm.createQueryBuilder(FlashSaleProduct, 'flashSaleProduct')
        flashSaleQuery
        .leftJoinAndSelect("flashSaleProduct.productProfile", "productProfile")
        .leftJoinAndSelect("flashSaleProduct.flashSale", "flashSale")
        const condition: any = { deletedAt: null, flashSale: {}, productProfile: {} }
        condition.flashSale.roundId = roundId
        condition.flashSale.status = 'active'
        condition.productProfile.status = 'public'
        condition.productProfile.approval = true
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