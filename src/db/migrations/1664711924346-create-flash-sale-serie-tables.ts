import {MigrationInterface, QueryRunner} from "typeorm";

export class createFlashSaleSerieTables1664711924346 implements MigrationInterface {
    name = 'createFlashSaleSerieTables1664711924346'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."flash_sale_product_profiles_discount_type_enum" AS ENUM('value', 'percentage')`);
        await queryRunner.query(`CREATE TABLE "flash_sale_product_profiles" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "flash_sale_id" integer NOT NULL, "product_profile_id" integer NOT NULL, "discount_type" "public"."flash_sale_product_profiles_discount_type_enum" NOT NULL DEFAULT 'value', "discount" numeric(14,4) NOT NULL, "limit_to_stock" integer, "limit_to_buy" integer, "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_96244aa5e2f5db1bc0eeb7bba83" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "flash_sale_rounds" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "date" TIMESTAMP NOT NULL, "start_time" TIMESTAMP NOT NULL, "end_time" TIMESTAMP NOT NULL, CONSTRAINT "PK_f2f2947986b2ad35bf50ab7ee2b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."flash_sales_status_enum" AS ENUM('active', 'inactive')`);
        await queryRunner.query(`CREATE TABLE "flash_sales" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "shop_id" integer NOT NULL, "round_id" integer NOT NULL, "status" "public"."flash_sales_status_enum" NOT NULL DEFAULT 'inactive', "visit_count" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_70299593044ffcba05cc30b97dc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "flash_sale_product_profiles" ADD CONSTRAINT "FK_6ec30544fe291a6f1f9e137fa4e" FOREIGN KEY ("flash_sale_id") REFERENCES "flash_sales"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "flash_sales" ADD CONSTRAINT "FK_502ff7a21844a8cece95683f4d7" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "flash_sales" ADD CONSTRAINT "FK_938f87ceb1a1ac5ebc07b90fde2" FOREIGN KEY ("round_id") REFERENCES "flash_sale_rounds"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "flash_sales" DROP CONSTRAINT "FK_938f87ceb1a1ac5ebc07b90fde2"`);
        await queryRunner.query(`ALTER TABLE "flash_sales" DROP CONSTRAINT "FK_502ff7a21844a8cece95683f4d7"`);
        await queryRunner.query(`ALTER TABLE "flash_sale_product_profiles" DROP CONSTRAINT "FK_6ec30544fe291a6f1f9e137fa4e"`);
        await queryRunner.query(`DROP TABLE "flash_sales"`);
        await queryRunner.query(`DROP TYPE "public"."flash_sales_status_enum"`);
        await queryRunner.query(`DROP TABLE "flash_sale_rounds"`);
        await queryRunner.query(`DROP TABLE "flash_sale_product_profiles"`);
        await queryRunner.query(`DROP TYPE "public"."flash_sale_product_profiles_discount_type_enum"`);
    }

}
