import {MigrationInterface, QueryRunner} from "typeorm";

export class addMobileToAddresses1656757338885 implements MigrationInterface {
    name = 'addMobileToAddresses1656757338885'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "addresses" ADD "mobile" character varying(20) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "mobile"`);
    }

}
