import { MigrationInterface, QueryRunner } from 'typeorm'

export class addPaymentOnTransactionTypeInHappyPointTransactions1668440562900
  implements MigrationInterface {
  name = 'addPaymentOnTransactionTypeInHappyPointTransactions1668440562900'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."happy_point_transactions_type_enum" RENAME TO "happy_point_transactions_type_enum_old"`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."happy_point_transactions_type_enum" AS ENUM('BUY', 'SELL', 'TRANSFER', 'PAYMENT')`,
    )
    await queryRunner.query(
      `ALTER TABLE "happy_point_transactions" ALTER COLUMN "type" TYPE "public"."happy_point_transactions_type_enum" USING "type"::"text"::"public"."happy_point_transactions_type_enum"`,
    )
    await queryRunner.query(
      `DROP TYPE "public"."happy_point_transactions_type_enum_old"`,
    )
    await queryRunner.query(
      `ALTER TABLE "product_profiles" DROP COLUMN "brand_id"`,
    )
    await queryRunner.query(
      `ALTER TABLE "product_profiles" ADD "brand_id" uuid`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_profiles" DROP COLUMN "brand_id"`,
    )
    await queryRunner.query(
      `ALTER TABLE "product_profiles" ADD "brand_id" character varying`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."happy_point_transactions_type_enum_old" AS ENUM('BUY', 'SELL', 'TRANSFER')`,
    )
    await queryRunner.query(
      `ALTER TABLE "happy_point_transactions" ALTER COLUMN "type" TYPE "public"."happy_point_transactions_type_enum_old" USING "type"::"text"::"public"."happy_point_transactions_type_enum_old"`,
    )
    await queryRunner.query(
      `DROP TYPE "public"."happy_point_transactions_type_enum"`,
    )
    await queryRunner.query(
      `ALTER TYPE "public"."happy_point_transactions_type_enum_old" RENAME TO "happy_point_transactions_type_enum"`,
    )
  }
}
