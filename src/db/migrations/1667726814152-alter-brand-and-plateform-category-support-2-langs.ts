import {MigrationInterface, QueryRunner} from "typeorm";

export class alterBrandAndPlateformCategorySupport2Langs1667726814152 implements MigrationInterface {
    name = 'alterBrandAndPlateformCategorySupport2Langs1667726814152'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "platform_categories" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "brands" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "platform_categories" ADD "name_th" character varying(40) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "platform_categories" ADD "name_en" character varying(40) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "platform_categories" ADD "icon" character varying`);
        await queryRunner.query(`ALTER TABLE "platform_categories" ADD "commission_rate" numeric(9,4) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "brands" ADD "name_th" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "brands" ADD "name_en" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "brands" DROP COLUMN "name_en"`);
        await queryRunner.query(`ALTER TABLE "brands" DROP COLUMN "name_th"`);
        await queryRunner.query(`ALTER TABLE "platform_categories" DROP COLUMN "commission_rate"`);
        await queryRunner.query(`ALTER TABLE "platform_categories" DROP COLUMN "icon"`);
        await queryRunner.query(`ALTER TABLE "platform_categories" DROP COLUMN "name_en"`);
        await queryRunner.query(`ALTER TABLE "platform_categories" DROP COLUMN "name_th"`);
        await queryRunner.query(`ALTER TABLE "brands" ADD "name" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "platform_categories" ADD "name" character varying(40) NOT NULL`);
    }

}
