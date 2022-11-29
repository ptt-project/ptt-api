import { Body, Controller, Get, Patch, Post } from '@nestjs/common'
import { Member } from 'src/db/entities/Member'
import { EntityManager, Transaction, TransactionManager } from 'typeorm'
import { Auth, ReqUser, Seller } from '../auth/auth.decorator'

import { RegisterService } from './service/register.service'
import { WalletService } from '../wallet/service/wallet.service'
import { ShopService } from '../shop/service/shop.service'
import { UpdateShopInfoRequestDto } from '../shop/dto/shop.dto'
import { RegisterSellerRequestDto } from './dto/seller.dto'
import { ConditionService } from '../shop/service/condition.service'

@Auth()
@Controller('v1/sellers')
export class SellerController {
  constructor(
    private readonly registerService: RegisterService,
    private readonly shopService: ShopService,
    private readonly walletService: WalletService,
    private readonly conditionService: ConditionService,
  ) {}

  @Post('/register')
  @Transaction()
  async registerSeller(
    @ReqUser() member: Member,
    @Body() body: RegisterSellerRequestDto,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.registerService.RegisterSellerHandler(
      this.registerService.ValidateSellerDataFunc(etm),
      this.registerService.InsertShopToDbFunc(etm),
      this.conditionService.InsertConditionToDbFunc(etm),
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
    return await this.registerService.ResubmitRegisterSellerHandler(
      this.registerService.ValidateSellerDataFunc(etm),
      this.registerService.ResubmitShopToDbFunc(etm),
    )(member, body)
  }

  @Seller()
  @Get('/shop-info')
  @Transaction()
  async getShopoInfo(
    @ReqUser() member: Member,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.shopService.GetShopInfoHandler(
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
    return await this.shopService.UpdateShopInfoHandler(
      this.shopService.UpdateShopByMemberIdFunc(etm),
    )(member, body)
  }
}
