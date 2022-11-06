import {MigrationInterface, QueryRunner} from "typeorm";

export class addColumnLoginTokenToTableMembers1664095827002 implements MigrationInterface {
    name = 'addColumnLoginTokenToTableMembers1664095827002'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "members" ADD "login_token" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "members" DROP COLUMN "login_token"`);
    }

}
