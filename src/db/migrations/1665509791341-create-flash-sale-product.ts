import {MigrationInterface, QueryRunner} from "typeorm";

export class createFlashSaleProduct1665509791341 implements MigrationInterface {
    name = 'createFlashSaleProduct1665509791341'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."flash_sale_products_discount_type_enum" AS ENUM('value', 'percentage')`);
        await queryRunner.query(`CREATE TABLE "flash_sale_products" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "flash_sale_id" integer NOT NULL, "product_profile_id" integer NOT NULL, "product_id" integer NOT NULL, "discount_type" "public"."flash_sale_products_discount_type_enum" NOT NULL DEFAULT 'value', "discount" numeric(14,4) NOT NULL, "min_price" numeric(14,4) NOT NULL, "max_price" numeric(14,4) NOT NULL, "limit_to_stock" integer, "limit_to_buy" integer, "sold" integer NOT NULL DEFAULT '0', "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_d87336248cdf6a0941552f621f7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "product_profiles" ADD "min_price" numeric(14,4) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_profiles" ADD "max_price" numeric(14,4) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "flash_sale_products" ADD CONSTRAINT "FK_feed21927beb816dc903d910ef5" FOREIGN KEY ("flash_sale_id") REFERENCES "flash_sales"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "flash_sale_products" ADD CONSTRAINT "FK_05185c7e101ef036beeee661cdb" FOREIGN KEY ("product_profile_id") REFERENCES "product_profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "flash_sale_products" ADD CONSTRAINT "FK_f049f078782ea89f22e2dcbf34f" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "flash_sale_products" DROP CONSTRAINT "FK_f049f078782ea89f22e2dcbf34f"`);
        await queryRunner.query(`ALTER TABLE "flash_sale_products" DROP CONSTRAINT "FK_05185c7e101ef036beeee661cdb"`);
        await queryRunner.query(`ALTER TABLE "flash_sale_products" DROP CONSTRAINT "FK_feed21927beb816dc903d910ef5"`);
        await queryRunner.query(`ALTER TABLE "product_profiles" DROP COLUMN "max_price"`);
        await queryRunner.query(`ALTER TABLE "product_profiles" DROP COLUMN "min_price"`);
        await queryRunner.query(`DROP TABLE "flash_sale_products"`);
        await queryRunner.query(`DROP TYPE "public"."flash_sale_products_discount_type_enum"`);
    }

}
