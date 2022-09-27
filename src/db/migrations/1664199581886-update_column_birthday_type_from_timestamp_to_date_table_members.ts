import {MigrationInterface, QueryRunner} from "typeorm";

export class updateColumnBirthdayTypeFromTimestampToDateTableMembers1664199581886 implements MigrationInterface {
    name = 'updateColumnBirthdayTypeFromTimestampToDateTableMembers1664199581886'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "members" DROP COLUMN "birthday"`);
        await queryRunner.query(`ALTER TABLE "members" ADD "birthday" date`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "members" DROP COLUMN "birthday"`);
        await queryRunner.query(`ALTER TABLE "members" ADD "birthday" TIMESTAMP`);
    }

}
