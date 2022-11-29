import { MigrationInterface, QueryRunner } from 'typeorm'

export class removeColumnStatusInOrderShopProducts1669657124193
  implements MigrationInterface {
  name = 'removeColumnStatusInOrderShopProducts1669657124193'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_shop_products" DROP COLUMN "status"`,
    )
    await queryRunner.query(
      `DROP TYPE "public"."order_shop_products_status_enum"`,
    )
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "PAID_id"`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "PAID_id" character varying`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."order_shop_products_status_enum" AS ENUM('toPay', 'toShip', 'toReceive', 'complated', 'cancelled', 'return', 'refund')`,
    )
    await queryRunner.query(
      `ALTER TABLE "order_shop_products" ADD "status" "public"."order_shop_products_status_enum" NOT NULL`,
    )
  }
}
