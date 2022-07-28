import { MigrationInterface, QueryRunner } from 'typeorm'

export class createPlatformCategories1658421857604
  implements MigrationInterface {
  name = 'createPlatformCategories1658421857604'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."platform_categories_status_enum" AS ENUM('active', 'inactive')`,
    )
    await queryRunner.query(
      `CREATE TABLE "platform_categories" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying(40) NOT NULL, "status" "public"."platform_categories_status_enum" NOT NULL DEFAULT 'inactive', "product_count" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_f6c5cd49610c2ce3e25bb6bea7b" PRIMARY KEY ("id"))`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "platform_categories"`)
    await queryRunner.query(
      `DROP TYPE "public"."platform_categories_status_enum"`,
    )
  }
}
