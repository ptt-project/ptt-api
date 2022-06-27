import {MigrationInterface, QueryRunner} from "typeorm";

export class updateOtpField1656348055389 implements MigrationInterface {
    name = 'updateOtpField1656348055389'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "otps" DROP COLUMN "mobile"`);
        await queryRunner.query(`ALTER TABLE "otps" DROP COLUMN "detail"`);
        await queryRunner.query(`ALTER TABLE "otps" ADD "reference" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "otps" ADD "type" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "otps" DROP COLUMN "type"`);
        await queryRunner.query(`ALTER TABLE "otps" DROP COLUMN "reference"`);
        await queryRunner.query(`ALTER TABLE "otps" ADD "detail" character varying`);
        await queryRunner.query(`ALTER TABLE "otps" ADD "mobile" character varying(20) NOT NULL`);
    }

}
