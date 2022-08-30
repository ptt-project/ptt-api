import {MigrationInterface, QueryRunner} from "typeorm";

export class updateProductBrandIdRequired1658508289918 implements MigrationInterface {
    name = 'updateProductBrandIdRequired1658508289918'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_profiles" ALTER COLUMN "brand_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "brand_id" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "brand_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_profiles" ALTER COLUMN "brand_id" SET NOT NULL`);
    }

}
