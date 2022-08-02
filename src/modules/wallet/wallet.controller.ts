import {
  Controller,
  Get,
  Query,
} from '@nestjs/common'
import { EntityManager, Transaction, TransactionManager } from 'typeorm'
import { Auth, ReqWallet } from '../auth/auth.decorator'

import { WalletService } from './wallet.service'
import { getWalletTransactionQueryDTO } from './dto/wallet.dto'
import { Wallet } from 'src/db/entities/Wallet'

@Auth()
@Controller('v1/wallets')
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
  ) {}

  @Get('/')
  async getWallet(
    @ReqWallet() wallet: Wallet,
  ) {
    return await this.walletService.GetWalletHandler()(wallet)
  }

  @Get('/history')
  @Transaction()
  async getWalletTransaction(
    @ReqWallet() wallet: Wallet,
    @Query() query: getWalletTransactionQueryDTO,
    @TransactionManager() etm: EntityManager,
  ) {
    return await this.walletService.GetWalletTransactionHandler(
      this.walletService.InqueryWalletTransactionFromDbFunc(etm)
    )(wallet, query)
  }
}
