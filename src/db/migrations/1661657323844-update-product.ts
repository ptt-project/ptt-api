import {MigrationInterface, QueryRunner} from "typeorm";

export class updateProduct1661657323844 implements MigrationInterface {
    name = 'updateProduct1661657323844'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ADD "shop_id" integer`);
        await queryRunner.query(`ALTER TABLE "products" ADD "platform_category_id" integer`);
        await queryRunner.query(`ALTER TABLE "product_profiles" ADD CONSTRAINT "FK_8732b4f5d6059c2f70c866dd8d7" FOREIGN KEY ("platform_category_id") REFERENCES "platform_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_9e952e93f369f16e27dd786c33f" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_1d1f56bfde0986bdcbdb5c25dad" FOREIGN KEY ("platform_category_id") REFERENCES "platform_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_1d1f56bfde0986bdcbdb5c25dad"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_9e952e93f369f16e27dd786c33f"`);
        await queryRunner.query(`ALTER TABLE "product_profiles" DROP CONSTRAINT "FK_8732b4f5d6059c2f70c866dd8d7"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "platform_category_id"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "shop_id"`);
    }

}
