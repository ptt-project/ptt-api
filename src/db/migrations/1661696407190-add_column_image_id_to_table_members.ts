import {MigrationInterface, QueryRunner} from "typeorm";

export class addColumnImageIdToTableMembers1661696407190 implements MigrationInterface {
    name = 'addColumnImageIdToTableMembers1661696407190'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "members" ADD "image_id" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "members" DROP COLUMN "image_id"`);
    }

}
