import { MigrationInterface, QueryRunner } from 'typeorm'

export class createCategoryProductProfiles1658590344689
  implements MigrationInterface {
  name = 'createCategoryProductProfiles1658590344689'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "category_product_profiles" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "category_id" integer NOT NULL, "product_profile_id" integer NOT NULL, CONSTRAINT "PK_1042feb9588550ab0beecc01ec5" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `ALTER TABLE "category_product_profiles" ADD CONSTRAINT "FK_4ad19847db4ff39f54e429e8494" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "category_product_profiles" DROP CONSTRAINT "FK_7228910954a388d6f94c9685853"`,
    )
    await queryRunner.query(
      `ALTER TABLE "category_product_profiles" DROP CONSTRAINT "FK_4ad19847db4ff39f54e429e8494"`,
    )
    await queryRunner.query(`DROP TABLE "category_product_profiles"`)
  }
}
