import { Command, Console } from 'nestjs-console'
import {
  Connection,
  EntityManager,
  getConnection,
  Transaction,
  TransactionManager,
} from 'typeorm'
import { AuthService } from '../auth/auth.service'
import { RegisterRequestDto } from '../auth/dto/register.dto'
import { WalletService } from '../wallet/wallet.service'
import { Member } from 'src/db/entities/Member'
import { Wallet } from 'src/db/entities/Wallet'
import { randomUUID } from 'crypto'

@Console()
export class UnitTestConsoleService {
  constructor(
    private readonly authService: AuthService,
    private readonly walletService: WalletService,
  ) {}

  @Command({
    command: 'test-adjust-wallet',
    description: 'testing wallet adjustment function',
  })
  @Transaction()
  async testAdjustWallet(@TransactionManager() etm: EntityManager) {
    let wallet: Wallet
    try {
      let member = await etm.findOne(Member, {
        where: { username: 'testuser01' },
        relations: ['wallets'],
      })
      if (!member) {
        const createUserParams: RegisterRequestDto = {
          firstName: 'firstname01',
          lastName: 'lastname01',
          email: 'test@gmail.com',
          mobile: '0812345678',
          username: 'testuser01',
          password: '1234567890',
          pdpaStatus: true,
          otpCode: '',
          refCode: '',
        }
        const [newMember, errorCreateUser] = await (
          await this.authService.insertMemberToDbFunc(etm)
        )(createUserParams)
        if (errorCreateUser != '') {
          return console.log('create user error =>', errorCreateUser)
        }
        member = newMember
      }
      if (!member.wallets[0]) {
        const [newWallet, errorCreateWallet] = await (
          await this.walletService.InsertWalletToDbFunc(etm)
        )(member.id)
        if (errorCreateWallet != '') {
          return console.log('create wallet error =>', errorCreateWallet)
        }

        wallet = newWallet
      } else {
        wallet = member.wallets[0]
      }

      const backupBalance = wallet.balance
      const adjustBalance = 1000
      const expectedBalance = wallet.balance + adjustBalance

      const [adjustedWallet, adjustWalletError] = await (
        await this.walletService.AdjustWalletInDbFunc(etm)
      )(wallet.id, adjustBalance, 'deposit')

      if (adjustWalletError != '') {
        console.log('adjust wallet error =>', adjustWalletError)
      }

      if (expectedBalance === adjustedWallet.balance) {
        console.log(
          'adjust positive wallet balance is working correctly => ',
          adjustedWallet,
        )
      } else {
        console.log(
          'adjust positive wallet balance is not working correctly => ',
          adjustedWallet,
        )
        console.log('expected balance is => ', expectedBalance)
      }

      wallet = adjustedWallet
      const adjustBalanceNegative = wallet.balance - 1
      const expectedBalanceNegative = wallet.balance - adjustBalanceNegative

      const [adjustedWalletNegative, adjustWalletNagativeError] = await (
        await this.walletService.AdjustWalletInDbFunc(etm)
      )(wallet.id, adjustBalanceNegative, 'withdraw')

      if (adjustWalletNagativeError != '') {
        console.log(
          'adjust negative wallet balance error =>',
          adjustWalletNagativeError,
        )
      }

      if (expectedBalanceNegative === adjustedWalletNegative.balance) {
        console.log(
          'adjust negative wallet balance is working correctly => ',
          adjustedWalletNegative,
        )
      } else {
        console.log(
          'adjust negative wallet balance is not working correctly => ',
          adjustedWalletNegative,
        )
        console.log('expected balance is => ', expectedBalanceNegative)
      }

      wallet = adjustedWalletNegative
      const adjustBalanceNegativeFailCase = wallet.balance + 1

      const [
        adjustedWalletNegativeFailCase,
        adjustWalletNagativeFailCaseError,
      ] = await (await this.walletService.AdjustWalletInDbFunc(etm))(
        wallet.id,
        adjustBalanceNegativeFailCase,
        'withdraw',
      )

      if (
        adjustWalletNagativeFailCaseError ===
        'your wallet balance is not enough'
      ) {
        console.log(
          'adjust negative wallet balance error correctly =>',
          adjustWalletNagativeFailCaseError,
        )
      } else {
        console.log(
          'adjust negative wallet balance should error =>',
          adjustedWalletNegativeFailCase,
        )
      }

      const [restoredWallet, restoreWalletError] = await (
        await this.walletService.AdjustWalletInDbFunc(etm)
      )(wallet.id, backupBalance - wallet.balance, 'deposit')

      if (restoreWalletError != '') {
        return console.log('restore wallet error =>', restoreWalletError)
      }
      wallet = restoredWallet
      throw 'error'
    } catch (error) {
      console.log('testing error => ', error)
    }

    console.log('restore wallet successfuly => ', wallet)

    const [adjusedWalletSellHappy, requestSellHappyPointError] = await (
      await this.walletService.RequestInteranlWalletTransactionService(
        this.walletService.InsertTransactionToDbFunc(etm),
        this.walletService.InsertReferenceToDbFunc(etm),
        this.walletService.UpdateReferenceToDbFunc(etm),
        this.walletService.AdjustWalletInDbFunc(etm),
      )
    )(wallet.id, 1000, 'sell_happy_point', randomUUID(), 'Sell Happy point')

    if (requestSellHappyPointError != '') {
      return console.log('adjust wallet error =>', requestSellHappyPointError)
    }

    console.log('adjust wallet successfuly => ', adjusedWalletSellHappy)
    const [adjusedWalletBuyHappy, requestBuyHappyPointError] = await (
      await this.walletService.RequestInteranlWalletTransactionService(
        this.walletService.InsertTransactionToDbFunc(etm),
        this.walletService.InsertReferenceToDbFunc(etm),
        this.walletService.UpdateReferenceToDbFunc(etm),
        this.walletService.AdjustWalletInDbFunc(etm),
      )
    )(wallet.id, 200, 'buy_happy_point', randomUUID(), 'Buy Happy point')

    if (requestBuyHappyPointError != '') {
      return console.log('adjust wallet error =>', requestBuyHappyPointError)
    }

    console.log('adjust wallet successfuly => ', adjusedWalletBuyHappy)
  }
}
