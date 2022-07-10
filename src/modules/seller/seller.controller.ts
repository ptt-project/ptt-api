import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common'
import { Member } from 'src/db/entities/Member'
import { EntityManager, Transaction, TransactionManager } from 'typeorm'
import { Auth, ReqUser } from '../auth/auth.decorator'

import { RegisterService } from './register.service'
import {
  RegisterSellerRequestDto,
} from './dto/seller.dto'

@Auth()
@Controller('v1/sellers')
export class SellerController {
  constructor(private readonly registerService: RegisterService) {}

  @Post('/register')
  @Transaction()
  async registerSeller(
    @ReqUser() member: Member,
    @Body() body: RegisterSellerRequestDto,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.registerService.registerSellerHandler(
      this.registerService.validateSellerDataFunc(etm),
      this.registerService.insertShopToDbFunc(etm),
    )(member, body)
  }

  @Patch('/register/resubmit')
  @Transaction()
  async resubmitRegisterSeller(
    @ReqUser() member: Member,
    @Body() body: RegisterSellerRequestDto,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.registerService.resubmitRegisterSellerHandler(
      this.registerService.validateSellerDataFunc(etm),
      this.registerService.resubmitShopToDbFunc(etm),
    )(member, body)
  }
}
