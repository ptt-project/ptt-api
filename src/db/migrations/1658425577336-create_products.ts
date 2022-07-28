import { MigrationInterface, QueryRunner } from 'typeorm'

export class createProducts1658425577336 implements MigrationInterface {
  name = 'createProducts1658425577336'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "products" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "sku" character varying NOT NULL, "product_profile_id" integer NOT NULL, "shop_id" integer NOT NULL, "platform_category_id" integer NOT NULL, "brand_id" integer NOT NULL, "option1" character varying NOT NULL, "option2" character varying NOT NULL, "price" numeric(5,2) NOT NULL, "stock" integer NOT NULL, CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`,
    )

    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "FK_457d6054a6aeea30985bac2f2a8" FOREIGN KEY ("product_profile_id") REFERENCES "product_profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "FK_9e952e93f369f16e27dd786c33f" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "FK_1d1f56bfde0986bdcbdb5c25dad" FOREIGN KEY ("platform_category_id") REFERENCES "platform_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "FK_1d1f56bfde0986bdcbdb5c25dad"`,
    )
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "FK_9e952e93f369f16e27dd786c33f"`,
    )
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "FK_457d6054a6aeea30985bac2f2a8"`,
    )
    await queryRunner.query(`DROP TABLE "products"`)
  }
}
