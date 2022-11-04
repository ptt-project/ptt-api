import {MigrationInterface, QueryRunner} from "typeorm";

export class createOrder1667021161383 implements MigrationInterface {
    name = 'createOrder1667021161383'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "bank_payment" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "account_number" character varying NOT NULL, CONSTRAINT "PK_6159bfc2d6d6ceb9dce2a4166ae" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."order_shop_products_status_enum" AS ENUM('toPay', 'toShip', 'toReceive', 'complated', 'cancelled', 'return', 'refund')`);
        await queryRunner.query(`CREATE TABLE "order_shop_products" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "order_shop_id" uuid NOT NULL, "unit_price" numeric(12,2) NOT NULL DEFAULT '0', "units" integer NOT NULL, "product_profile_image" character varying, "product_profile_name" character varying NOT NULL, "product_id" uuid NOT NULL, "product_options_1" character varying, "product_options_2" character varying, "status" "public"."order_shop_products_status_enum" NOT NULL, "product_profile_json" text NOT NULL, CONSTRAINT "PK_4441dd3aef5abdc735a4255e897" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "shipping_option" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, CONSTRAINT "PK_2e56fddaa65f3a26d402e5d786e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."order_shops_status_enum" AS ENUM('toPay', 'toShip', 'toReceive', 'complated', 'cancelled', 'return', 'refund')`);
        await queryRunner.query(`CREATE TABLE "order_shops" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "order_id" uuid NOT NULL, "shop_voucher_id" character varying, "shop_id" uuid NOT NULL, "order_shop_amount" numeric(12,2) NOT NULL DEFAULT '0', "shipping_option_id" uuid NOT NULL, "shipping_price" numeric(12,2) NOT NULL DEFAULT '0', "min_deliver_date" TIMESTAMP NOT NULL, "max_deliver_date" TIMESTAMP NOT NULL, "note" character varying, "status" "public"."order_shops_status_enum" NOT NULL, "send_date" TIMESTAMP, "expected_date" TIMESTAMP, CONSTRAINT "PK_b622fbbcefd200ba8c46edef0bf" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."orders_status_enum" AS ENUM('toPay', 'toShip', 'toReceive', 'complated', 'cancelled', 'return', 'refund')`);
        await queryRunner.query(`CREATE TABLE "orders" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "member_id" uuid NOT NULL, "happy_voucher_id" character varying, "payment_id" character varying, "merchandise_subtotal" numeric(12,2) NOT NULL DEFAULT '0', "shipping_total" numeric(12,2) NOT NULL DEFAULT '0', "discount" numeric(12,2) NOT NULL DEFAULT '0', "amount" numeric(12,2) NOT NULL DEFAULT '0', "name" character varying NOT NULL, "address" character varying NOT NULL, "province" character varying NOT NULL, "tambon" character varying NOT NULL, "district" character varying NOT NULL, "postcode" character varying(5) NOT NULL, "mobile" character varying(20) NOT NULL, "status" "public"."orders_status_enum" NOT NULL, CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."payments_payment_type_enum" AS ENUM('bank', 'happyPoint', 'ewallet', 'cashOnDelivery')`);
        await queryRunner.query(`CREATE TYPE "public"."payments_status_enum" AS ENUM('toPay', 'toShip', 'toReceive', 'complated', 'cancelled', 'return', 'refund')`);
        await queryRunner.query(`CREATE TABLE "payments" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "order_id" character varying, "payment_type" "public"."payments_payment_type_enum" NOT NULL, "bank_payment_id" uuid, "qr_code" character varying, "reference" character varying, "happy_point_transaction_id" character varying, "wallet_transaction_id" uuid, "status" "public"."payments_status_enum" NOT NULL, CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "category_product_profiles" DROP COLUMN "product_profile_id"`);
        await queryRunner.query(`ALTER TABLE "category_product_profiles" ADD "product_profile_id" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_options" DROP COLUMN "product_profile_id"`);
        await queryRunner.query(`ALTER TABLE "product_options" ADD "product_profile_id" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_profiles" DROP COLUMN "brand_id"`);
        await queryRunner.query(`ALTER TABLE "product_profiles" ADD "brand_id" character varying`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "product_profile_id"`);
        await queryRunner.query(`ALTER TABLE "products" ADD "product_profile_id" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "order_shop_products" ADD CONSTRAINT "FK_1cf1e2a3b16732dbe06a9d6d8d0" FOREIGN KEY ("order_shop_id") REFERENCES "order_shops"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_shop_products" ADD CONSTRAINT "FK_380161aaa1c70b977d373bfdcfb" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_shops" ADD CONSTRAINT "FK_1e9773baf4619e2c97c19e3ce8e" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_shops" ADD CONSTRAINT "FK_7dd196a8d7ebe30e99340805eed" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_shops" ADD CONSTRAINT "FK_ce3a943ab627c48172916aacb99" FOREIGN KEY ("shipping_option_id") REFERENCES "shipping_option"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_cec51276d127c44da30cd333a73" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "FK_5bcc46ad303c994feed6f8d3db1" FOREIGN KEY ("bank_payment_id") REFERENCES "bank_payment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "FK_a79e0d6b290a1d0e8f5e67a496e" FOREIGN KEY ("wallet_transaction_id") REFERENCES "wallet_transactions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_a79e0d6b290a1d0e8f5e67a496e"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_5bcc46ad303c994feed6f8d3db1"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_cec51276d127c44da30cd333a73"`);
        await queryRunner.query(`ALTER TABLE "order_shops" DROP CONSTRAINT "FK_ce3a943ab627c48172916aacb99"`);
        await queryRunner.query(`ALTER TABLE "order_shops" DROP CONSTRAINT "FK_7dd196a8d7ebe30e99340805eed"`);
        await queryRunner.query(`ALTER TABLE "order_shops" DROP CONSTRAINT "FK_1e9773baf4619e2c97c19e3ce8e"`);
        await queryRunner.query(`ALTER TABLE "order_shop_products" DROP CONSTRAINT "FK_380161aaa1c70b977d373bfdcfb"`);
        await queryRunner.query(`ALTER TABLE "order_shop_products" DROP CONSTRAINT "FK_1cf1e2a3b16732dbe06a9d6d8d0"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "product_profile_id"`);
        await queryRunner.query(`ALTER TABLE "products" ADD "product_profile_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_profiles" DROP COLUMN "brand_id"`);
        await queryRunner.query(`ALTER TABLE "product_profiles" ADD "brand_id" uuid`);
        await queryRunner.query(`ALTER TABLE "product_options" DROP COLUMN "product_profile_id"`);
        await queryRunner.query(`ALTER TABLE "product_options" ADD "product_profile_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "category_product_profiles" DROP COLUMN "product_profile_id"`);
        await queryRunner.query(`ALTER TABLE "category_product_profiles" ADD "product_profile_id" uuid NOT NULL`);
        await queryRunner.query(`DROP TABLE "payments"`);
        await queryRunner.query(`DROP TYPE "public"."payments_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."payments_payment_type_enum"`);
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`DROP TYPE "public"."orders_status_enum"`);
        await queryRunner.query(`DROP TABLE "order_shops"`);
        await queryRunner.query(`DROP TYPE "public"."order_shops_status_enum"`);
        await queryRunner.query(`DROP TABLE "shipping_option"`);
        await queryRunner.query(`DROP TABLE "order_shop_products"`);
        await queryRunner.query(`DROP TYPE "public"."order_shop_products_status_enum"`);
        await queryRunner.query(`DROP TABLE "bank_payment"`);
    }

}
