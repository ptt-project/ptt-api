import {MigrationInterface, QueryRunner} from "typeorm";

export class updateProductPromotion1661065360919 implements MigrationInterface {
    name = 'updateProductPromotion1661065360919'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_profile_promotions" ALTER COLUMN "discount" TYPE numeric(9,4)`);
        await queryRunner.query(`ALTER TABLE "product_profile_promotions" ALTER COLUMN "limit_to_stock" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_profile_promotions" ALTER COLUMN "limit_to_buy" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_profile_promotions" ALTER COLUMN "limit_to_buy" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_profile_promotions" ALTER COLUMN "limit_to_stock" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_profile_promotions" ALTER COLUMN "discount" TYPE numeric(5,4)`);
    }

}
