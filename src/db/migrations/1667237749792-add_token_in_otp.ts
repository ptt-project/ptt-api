import { MigrationInterface, QueryRunner } from 'typeorm'

export class addTokenInOtp1667237749792 implements MigrationInterface {
  name = 'addTokenInOtp1667237749792'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "otps" ADD "token" character varying`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "otps" DROP COLUMN "token"`)
  }
}
