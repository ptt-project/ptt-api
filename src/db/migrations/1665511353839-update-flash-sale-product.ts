import {MigrationInterface, QueryRunner} from "typeorm";

export class updateFlashSaleProduct1665511353839 implements MigrationInterface {
    name = 'updateFlashSaleProduct1665511353839'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "flash_sale_products" DROP COLUMN "min_price"`);
        await queryRunner.query(`ALTER TABLE "flash_sale_products" DROP COLUMN "max_price"`);
        await queryRunner.query(`ALTER TABLE "flash_sale_products" ADD "price" numeric(14,4) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "flash_sale_products" DROP COLUMN "price"`);
        await queryRunner.query(`ALTER TABLE "flash_sale_products" ADD "max_price" numeric(14,4) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "flash_sale_products" ADD "min_price" numeric(14,4) NOT NULL`);
    }

}
