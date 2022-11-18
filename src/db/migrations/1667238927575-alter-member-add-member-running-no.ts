import {MigrationInterface, QueryRunner} from "typeorm";

export class alterMemberAddMemberRunningNo1667238927575 implements MigrationInterface {
    name = 'alterMemberAddMemberRunningNo1667238927575'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "members" ADD "no" SERIAL NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "members" DROP COLUMN "no"`);
    }

}
