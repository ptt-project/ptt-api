import { MigrationInterface, QueryRunner } from 'typeorm'

export class createProductProfile1658425564495 implements MigrationInterface {
  name = 'createProductProfile1658425564495'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "product_profiles" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "detail" text NOT NULL, "shop_id" integer NOT NULL, "platform_category_id" integer NOT NULL, "brand_id" integer NOT NULL, "status" character varying NOT NULL, "approval" boolean NOT NULL DEFAULT false, "weight" numeric(5,2) NOT NULL, "exp" integer NOT NULL, "condition" character varying NOT NULL, "is_send_lated" boolean NOT NULL, "extra_day" integer NOT NULL, "video_link" character varying NOT NULL, "image_ids" text NOT NULL, "watched" integer NOT NULL DEFAULT '0', "like" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_bb8fba1cc1611d5c1b15aaf471f" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `ALTER TABLE "product_profiles" ADD CONSTRAINT "FK_566e19cb60106569b700174155a" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "product_profiles" ADD CONSTRAINT "FK_8732b4f5d6059c2f70c866dd8d7" FOREIGN KEY ("platform_category_id") REFERENCES "platform_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_profiles" DROP CONSTRAINT "FK_8732b4f5d6059c2f70c866dd8d7"`,
    )
    await queryRunner.query(
      `ALTER TABLE "product_profiles" DROP CONSTRAINT "FK_566e19cb60106569b700174155a"`,
    )
    await queryRunner.query(`DROP TABLE "product_profiles"`)
  }
}
