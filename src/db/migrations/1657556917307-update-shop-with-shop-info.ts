import {MigrationInterface, QueryRunner} from "typeorm";

export class updateShopWithShopInfo1657556917307 implements MigrationInterface {
    name = 'updateShopWithShopInfo1657556917307'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shops" ADD "shop_name" character varying(30)`);
        await queryRunner.query(`ALTER TABLE "shops" ADD "shop_description" character varying(500)`);
        await queryRunner.query(`ALTER TABLE "shops" ADD "product_count" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "shops" ADD "reply_rate" numeric(5,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "shops" ADD "shop_score" numeric(2,1) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "shops" ADD "score_count" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "shops" ADD "cancel_rate" numeric(5,2) NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shops" DROP COLUMN "cancel_rate"`);
        await queryRunner.query(`ALTER TABLE "shops" DROP COLUMN "score_count"`);
        await queryRunner.query(`ALTER TABLE "shops" DROP COLUMN "shop_score"`);
        await queryRunner.query(`ALTER TABLE "shops" DROP COLUMN "reply_rate"`);
        await queryRunner.query(`ALTER TABLE "shops" DROP COLUMN "product_count"`);
        await queryRunner.query(`ALTER TABLE "shops" DROP COLUMN "shop_description"`);
        await queryRunner.query(`ALTER TABLE "shops" DROP COLUMN "shop_name"`);
    }

}
