import { MigrationInterface, QueryRunner } from 'typeorm'

export class createBrands1658421756033 implements MigrationInterface {
  name = 'createBrands1658421756033'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "brands" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, CONSTRAINT "PK_b0c437120b624da1034a81fc561" PRIMARY KEY ("id"))`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "brands"`)
  }
}
