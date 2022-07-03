import {MigrationInterface, QueryRunner} from "typeorm";

export class addNameToAddresses1656757216048 implements MigrationInterface {
    name = 'addNameToAddresses1656757216048'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "addresses" ADD "name" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "name"`);
    }

}
