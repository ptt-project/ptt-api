import { MigrationInterface, QueryRunner } from 'typeorm'

export class chagneTypeGeoNameToJsonInAddresses1660564623967
  implements MigrationInterface {
  name = 'chagneTypeGeoNameToJsonInAddresses1660564623967'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "geo_name"`)
    await queryRunner.query(
      `ALTER TABLE "addresses" ADD "geo_name" text DEFAULT '{}'`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "geo_name"`)
    await queryRunner.query(
      `ALTER TABLE "addresses" ADD "geo_name" character varying`,
    )
  }
}
