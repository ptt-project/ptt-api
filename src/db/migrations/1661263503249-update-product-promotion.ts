import {MigrationInterface, QueryRunner} from "typeorm";

export class updateProductPromotion1661263503249 implements MigrationInterface {
    name = 'updateProductPromotion1661263503249'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_profile_promotions" DROP COLUMN "limit_to_stock"`);
        await queryRunner.query(`ALTER TABLE "product_profile_promotions" DROP COLUMN "limit_to_buy"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_profile_promotions" ADD "limit_to_buy" integer`);
        await queryRunner.query(`ALTER TABLE "product_profile_promotions" ADD "limit_to_stock" integer`);
    }

}
