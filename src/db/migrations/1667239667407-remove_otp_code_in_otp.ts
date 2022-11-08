import { MigrationInterface, QueryRunner } from 'typeorm'

export class removeOtpCodeInOtp1667239667407 implements MigrationInterface {
  name = 'removeOtpCodeInOtp1667239667407'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "otps" DROP COLUMN "otp_code"`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "otps" ADD "otp_code" character varying(6) NOT NULL`,
    )
  }
}
