import { Controller, Get, Query } from '@nestjs/common'
import { EntityManager, Transaction, TransactionManager } from 'typeorm'
import { Auth } from '../../auth/auth.decorator'
import { GetMemberFlashSaleQueryDTO } from '../dto/member-flash-sale.dto'
import { MemberFlashSaleService } from '../service/member-flash-sale.service'

@Auth()
@Controller('v1/members/flash-sales')
export class MemberFlashSaleController {
  constructor(private readonly flashSaleService: MemberFlashSaleService) {}

  @Get('/')
  @Transaction()
  async getMemberFlashSales(
    @Query() query: GetMemberFlashSaleQueryDTO,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.flashSaleService.GetMemberFlashSaleHandler(
      this.flashSaleService.InquiryCurrentFlashSaleRoundFunc(etm),
      this.flashSaleService.InquiryCurrentFlashSaleByRoundFunc(etm),
    )(query)
  }
}