import {MigrationInterface, QueryRunner} from "typeorm";

export class removeBalanceInMembers1662234574416 implements MigrationInterface {
    name = 'removeBalanceInMembers1662234574416'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "members" DROP COLUMN "balance"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "members" ADD "balance" numeric(12,4) NOT NULL DEFAULT '0'`);
    }

}
