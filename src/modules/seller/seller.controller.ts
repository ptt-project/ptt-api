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
import { Auth, ReqUser, Seller } from '../auth/auth.decorator'

import { RegisterService } from './service/register.service'
import {
  RegisterSellerRequestDto,
  UpdateShopInfoRequestDto,
} from './dto/seller.dto'
import { ShopService } from './service/shop.service'
import { WalletService } from '../wallet/service/wallet.service'

@Auth()
@Controller('v1/sellers')
export class SellerController {
  constructor(
    private readonly registerService: RegisterService,
    private readonly shopService: ShopService,
    private readonly walletService: WalletService,
  ) {}

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
      this.registerService.CreateTablePartitionOfProductProfileToDbFunc(etm),
      this.walletService.InsertWalletToDbFunc(etm),
      this.registerService.updateShopWalletFunc(etm),
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

  @Seller()
  @Get('/shop-info')
  @Transaction()
  async getShopoInfo(
    @ReqUser() member: Member,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.shopService.getShopInfoHandler(
      this.shopService.InquiryShopByMemberIdFunc(etm),
    )(member)
  }

  @Seller()
  @Patch('/shop-info')
  @Transaction()
  async updateShopoInfo(
    @ReqUser() member: Member,
    @Body() body: UpdateShopInfoRequestDto,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.shopService.updateShopInfoHandler(
      this.shopService.InquiryUpdateShopByMemberIdFunc(etm),
    )(member, body)
  }
}
