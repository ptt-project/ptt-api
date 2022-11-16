import { Command, Console } from 'nestjs-console'
import { EntityManager, Transaction, TransactionManager } from 'typeorm'
import { ConditionService } from 'src/modules/shop/service/condition.service'
import { Condition } from 'src/db/entities/Condition'
import { Shop } from 'src/db/entities/Shop'

@Console()
export class CreateConditionConsoleService {
  constructor(
    private readonly conditionService: ConditionService,
  ) {}

  @Command({
    command: 'create-condition',
    description: 'create condition for shop function',
  })
  @Transaction()
  async createCondition(
    @TransactionManager() etm: EntityManager,
  ) {
    const createdConditions: Condition[] = []
    try {
      const shops: Shop[] = await etm.find(Shop, { relations: ['condition'] })
      for (const shop of shops) {
        if (!shop.condition) {
          const [condition, createConditionError] = await (await this.conditionService.InsertConditionToDbFunc(etm))(shop)
          if (createConditionError != '') {
            console.log('Error to create condition for shop => ', shop.id)
            console.log('Error => ', createConditionError)
          }
          if (condition) {
            createdConditions.push(condition)
          }
        }
      }
    } catch (error) {
      console.log('error', error.message)
    }

    console.log('created conditions => ', createdConditions)
  }
}
