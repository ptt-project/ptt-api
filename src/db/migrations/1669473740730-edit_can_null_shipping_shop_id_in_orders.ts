import { MigrationInterface, QueryRunner } from 'typeorm'

export class editCanNullShippingShopIdInOrders1669473740730
  implements MigrationInterface {
  name = 'editCanNullShippingShopIdInOrders1669473740730'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_shops" ALTER COLUMN "shipping_option_id" DROP NOT NULL`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_shops" ALTER COLUMN "shipping_option_id" SET NOT NULL`,
    )
  }
}
