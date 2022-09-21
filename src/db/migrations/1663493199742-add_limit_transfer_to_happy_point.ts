import {MigrationInterface, QueryRunner} from "typeorm";

export class addLimitTransferToHappyPoint1663493199742 implements MigrationInterface {
    name = 'addLimitTransferToHappyPoint1663493199742'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "happy_points" ADD "limtit_transfer" numeric(12,4) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "happy_points" ALTER COLUMN "balance" TYPE numeric(12,4)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "happy_points" ALTER COLUMN "balance" TYPE numeric(12,2)`);
        await queryRunner.query(`ALTER TABLE "happy_points" DROP COLUMN "limtit_transfer"`);
    }

}
