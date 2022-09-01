import {MigrationInterface, QueryRunner} from "typeorm";

export class addColumnBalanceToTableMembers1662049465267 implements MigrationInterface {
    name = 'addColumnBalanceToTableMembers1662049465267'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "members" ADD "balance" numeric(12,4) NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "members" DROP COLUMN "balance"`);
    }

}
