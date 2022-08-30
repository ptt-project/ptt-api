import {MigrationInterface, QueryRunner} from "typeorm";

export class updateProductsDecimalPrice1658671715858 implements MigrationInterface {
    name = 'updateProductsDecimalPrice1658671715858'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "price" TYPE numeric(12,2)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "price" TYPE numeric(5,2)`);
    }

}
