import {MigrationInterface, QueryRunner} from "typeorm";

export class updateBankIcon1667051673631 implements MigrationInterface {
    name = 'updateBankIcon1667051673631'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "banks" ADD "icon" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "banks" DROP COLUMN "icon"`);
    }

}
