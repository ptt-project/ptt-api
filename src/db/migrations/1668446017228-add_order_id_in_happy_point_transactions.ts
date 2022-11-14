import { MigrationInterface, QueryRunner } from 'typeorm'

export class addOrderIdInHappyPointTransactions1668446017228
  implements MigrationInterface {
  name = 'addOrderIdInHappyPointTransactions1668446017228'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "happy_point_transactions" ADD "order_id" uuid`,
    )
    await queryRunner.query(
      `ALTER TABLE "happy_point_transactions" ADD CONSTRAINT "FK_4133a2e77dd01390da7c0551f23" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "happy_point_transactions" DROP CONSTRAINT "FK_4133a2e77dd01390da7c0551f23"`,
    )
    await queryRunner.query(
      `ALTER TABLE "happy_point_transactions" DROP COLUMN "order_id"`,
    )
  }
}
