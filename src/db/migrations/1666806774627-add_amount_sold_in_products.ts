import { MigrationInterface, QueryRunner } from 'typeorm'

export class addAmountSoldInProducts1666806774627
  implements MigrationInterface {
  name = 'addAmountSoldInProducts1666806774627'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" ADD "amount_sold" integer NOT NULL DEFAULT '0'`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "amount_sold"`)
  }
}
