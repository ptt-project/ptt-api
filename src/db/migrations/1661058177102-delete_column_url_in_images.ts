import {MigrationInterface, QueryRunner} from "typeorm";

export class deleteColumnUrlInImages1661058177102 implements MigrationInterface {
    name = 'deleteColumnUrlInImages1661058177102'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "images" DROP COLUMN "thumnail_url"`);
        await queryRunner.query(`ALTER TABLE "images" DROP COLUMN "large_url"`);
        await queryRunner.query(`ALTER TABLE "images" DROP COLUMN "medium_url"`);
        await queryRunner.query(`ALTER TABLE "images" DROP COLUMN "small_url"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "images" ADD "small_url" character varying`);
        await queryRunner.query(`ALTER TABLE "images" ADD "medium_url" character varying`);
        await queryRunner.query(`ALTER TABLE "images" ADD "large_url" character varying`);
        await queryRunner.query(`ALTER TABLE "images" ADD "thumnail_url" character varying`);
    }

}
