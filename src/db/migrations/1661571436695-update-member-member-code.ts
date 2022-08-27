import {MigrationInterface, QueryRunner} from "typeorm";

export class updateMemberMemberCode1661571436695 implements MigrationInterface {
    name = 'updateMemberMemberCode1661571436695'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "members" ADD "member_code" character varying(7) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "members" DROP COLUMN "member_code"`);
    }

}
