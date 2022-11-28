import { MigrationInterface, QueryRunner } from 'typeorm'

export class refactorOrders1669132497354 implements MigrationInterface {
  name = 'refactorOrders1669132497354'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "payment_type"`)
    await queryRunner.query(`DROP TYPE "public"."payments_payment_type_enum"`)
    await queryRunner.query(
      `ALTER TABLE "payments" DROP COLUMN "happy_point_transaction_id"`,
    )
    await queryRunner.query(
      `ALTER TABLE "order_shops" DROP COLUMN "order_shop_amount"`,
    )
    await queryRunner.query(
      `ALTER TABLE "order_shops" DROP COLUMN "shipping_price"`,
    )
    await queryRunner.query(
      `ALTER TABLE "order_shops" DROP COLUMN "order_number"`,
    )
    await queryRunner.query(
      `ALTER TABLE "orders" DROP COLUMN "merchandise_subtotal"`,
    )
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "shipping_total"`)
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "amount"`)
    await queryRunner.query(
      `ALTER TABLE "payments" ADD "paymentable_id" uuid NOT NULL`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."payments_paymentable_type_enum" AS ENUM('BANK', 'HAPPYPOINT', 'EWALLET', 'CASHONDELIVERY')`,
    )
    await queryRunner.query(
      `ALTER TABLE "payments" ADD "paymentable_type" "public"."payments_paymentable_type_enum" NOT NULL`,
    )
    await queryRunner.query(
      `ALTER TABLE "order_shops" ADD "code" character varying NOT NULL`,
    )
    await queryRunner.query(
      `ALTER TABLE "order_shops" ADD "totalPrice" numeric(12,2) NOT NULL DEFAULT '0'`,
    )
    await queryRunner.query(
      `ALTER TABLE "order_shops" ADD "total_price_of_products" numeric(12,2) NOT NULL`,
    )
    await queryRunner.query(
      `ALTER TABLE "order_shops" ADD "total_price_of_shippings" numeric(12,2) NOT NULL`,
    )
    await queryRunner.query(
      `ALTER TABLE "order_shops" ADD "discount" numeric(12,2) NOT NULL`,
    )
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "code" character varying NOT NULL`,
    )
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "PAID_id" character varying`,
    )
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "totalPrice" numeric(12,2) NOT NULL DEFAULT '0'`,
    )
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "total_price_of_products" numeric(12,2) NOT NULL`,
    )
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "total_price_of_shippings" numeric(12,2) NOT NULL`,
    )
    await queryRunner.query(
      `ALTER TYPE "public"."payments_status_enum" RENAME TO "payments_status_enum_old"`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."payments_status_enum" AS ENUM('WAITING_PAYMENT', 'COMPLETED', 'CANCELLED', 'RETURN', 'REFUND')`,
    )
    await queryRunner.query(
      `ALTER TABLE "payments" ALTER COLUMN "status" TYPE "public"."payments_status_enum" USING "status"::"text"::"public"."payments_status_enum"`,
    )
    await queryRunner.query(`DROP TYPE "public"."payments_status_enum_old"`)

    await queryRunner.query(
      `ALTER TYPE "public"."order_shops_status_enum" RENAME TO "order_shops_status_enum_old"`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."order_shops_status_enum" AS ENUM('BOOKING', 'SHIPPING', 'COMPLETE', 'CANCEL')`,
    )
    await queryRunner.query(
      `ALTER TABLE "order_shops" ALTER COLUMN "status" TYPE "public"."order_shops_status_enum" USING "status"::"text"::"public"."order_shops_status_enum"`,
    )
    await queryRunner.query(`DROP TYPE "public"."order_shops_status_enum_old"`)
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "discount" DROP DEFAULT`,
    )
    await queryRunner.query(
      `ALTER TYPE "public"."orders_status_enum" RENAME TO "orders_status_enum_old"`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."orders_status_enum" AS ENUM('WAITING_PAYMENT', 'PAID', 'CANCELLED')`,
    )
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "status" TYPE "public"."orders_status_enum" USING "status"::"text"::"public"."orders_status_enum"`,
    )
    await queryRunner.query(`DROP TYPE "public"."orders_status_enum_old"`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."orders_status_enum_old" AS ENUM('toPay', 'toShip', 'toReceive', 'complated', 'cancelled', 'return', 'refund')`,
    )
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "status" TYPE "public"."orders_status_enum_old" USING "status"::"text"::"public"."orders_status_enum_old"`,
    )
    await queryRunner.query(`DROP TYPE "public"."orders_status_enum"`)
    await queryRunner.query(
      `ALTER TYPE "public"."orders_status_enum_old" RENAME TO "orders_status_enum"`,
    )
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "discount" SET DEFAULT '0'`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."order_shops_status_enum_old" AS ENUM('toPay', 'toShip', 'toReceive', 'complated', 'cancelled', 'return', 'refund')`,
    )
    await queryRunner.query(
      `ALTER TABLE "order_shops" ALTER COLUMN "status" TYPE "public"."order_shops_status_enum_old" USING "status"::"text"::"public"."order_shops_status_enum_old"`,
    )
    await queryRunner.query(`DROP TYPE "public"."order_shops_status_enum"`)
    await queryRunner.query(
      `ALTER TYPE "public"."order_shops_status_enum_old" RENAME TO "order_shops_status_enum"`,
    )

    await queryRunner.query(
      `CREATE TYPE "public"."payments_status_enum_old" AS ENUM('toPay', 'toShip', 'toReceive', 'complated', 'cancelled', 'return', 'refund')`,
    )
    await queryRunner.query(
      `ALTER TABLE "payments" ALTER COLUMN "status" TYPE "public"."payments_status_enum_old" USING "status"::"text"::"public"."payments_status_enum_old"`,
    )
    await queryRunner.query(`DROP TYPE "public"."payments_status_enum"`)
    await queryRunner.query(
      `ALTER TYPE "public"."payments_status_enum_old" RENAME TO "payments_status_enum"`,
    )
    await queryRunner.query(
      `ALTER TABLE "orders" DROP COLUMN "total_price_of_shippings"`,
    )
    await queryRunner.query(
      `ALTER TABLE "orders" DROP COLUMN "total_price_of_products"`,
    )
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "totalPrice"`)
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "PAID_id"`)
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "code"`)
    await queryRunner.query(`ALTER TABLE "order_shops" DROP COLUMN "discount"`)
    await queryRunner.query(
      `ALTER TABLE "order_shops" DROP COLUMN "total_price_of_shippings"`,
    )
    await queryRunner.query(
      `ALTER TABLE "order_shops" DROP COLUMN "total_price_of_products"`,
    )
    await queryRunner.query(
      `ALTER TABLE "order_shops" DROP COLUMN "totalPrice"`,
    )
    await queryRunner.query(`ALTER TABLE "order_shops" DROP COLUMN "code"`)
    await queryRunner.query(
      `ALTER TABLE "payments" DROP COLUMN "paymentable_type"`,
    )
    await queryRunner.query(
      `DROP TYPE "public"."payments_paymentable_type_enum"`,
    )
    await queryRunner.query(
      `ALTER TABLE "payments" DROP COLUMN "paymentable_id"`,
    )
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "amount" numeric(12,2) NOT NULL DEFAULT '0'`,
    )
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "shipping_total" numeric(12,2) NOT NULL DEFAULT '0'`,
    )
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "merchandise_subtotal" numeric(12,2) NOT NULL DEFAULT '0'`,
    )
    await queryRunner.query(
      `ALTER TABLE "order_shops" ADD "order_number" character varying NOT NULL`,
    )
    await queryRunner.query(
      `ALTER TABLE "order_shops" ADD "shipping_price" numeric(12,2) NOT NULL DEFAULT '0'`,
    )
    await queryRunner.query(
      `ALTER TABLE "order_shops" ADD "order_shop_amount" numeric(12,2) NOT NULL DEFAULT '0'`,
    )
    await queryRunner.query(
      `ALTER TABLE "payments" ADD "happy_point_transaction_id" character varying`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."payments_payment_type_enum" AS ENUM('bank', 'happyPoint', 'ewallet', 'cashOnDelivery')`,
    )
    await queryRunner.query(
      `ALTER TABLE "payments" ADD "payment_type" "public"."payments_payment_type_enum" NOT NULL`,
    )
  }
}
