import { MigrationInterface, QueryRunner } from 'typeorm'

export class editSizeRefCodeInOtp1667240060933 implements MigrationInterface {
  name = 'editSizeRefCodeInOtp1667240060933'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "otps" DROP COLUMN "ref_code"`)
    await queryRunner.query(
      `ALTER TABLE "otps" ADD "ref_code" character varying(6) NOT NULL`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "otps" DROP COLUMN "ref_code"`)
    await queryRunner.query(
      `ALTER TABLE "otps" ADD "ref_code" character varying(4) NOT NULL`,
    )
  }
}
