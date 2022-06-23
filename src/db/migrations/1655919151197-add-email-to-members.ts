import {MigrationInterface, QueryRunner} from "typeorm";

export class addEmailToMembers1655919151197 implements MigrationInterface {
    name = 'addEmailToMembers1655919151197'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "members" ADD "email" character varying(50) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "members" DROP COLUMN "email"`);
    }

}
