import { Command, Console } from 'nestjs-console'
import { EntityManager, Transaction, TransactionManager } from 'typeorm'
import { WalletService } from '../wallet/wallet.service'
import { Member } from 'src/db/entities/Member'
import { Wallet } from 'src/db/entities/Wallet'

@Console()
export class CreateWalletConsoleService {
  constructor(
    private readonly walletService: WalletService,
  ) {}

  @Command({
    command: 'create-wallet',
    description: 'create wallet for member function',
  })
  @Transaction()
  async createWallet(
    @TransactionManager() etm: EntityManager,
  ) {
    const createdWallets: Wallet[] = []
    try {
      const members: Member[] = await etm.find(Member, { relations: ['wallets'] })
      console.log('members', members)
      for (const member of members) {
        if (member.wallets.length === 0) {
          const [wallet, createWalletError] = await (await this.walletService.InsertWalletToDbFunc(etm))(member.id)
          if (createWalletError != '') {
            console.log('Error to create wallet for member => ', member.id)
            console.log('Error => ', createWalletError)
          }
          if (wallet) {
            createdWallets.push(wallet)
          }
        }
      }
    } catch (error) {
      console.log('error', error)
    }

    console.log('created wallets => ', createdWallets)
  }
}
