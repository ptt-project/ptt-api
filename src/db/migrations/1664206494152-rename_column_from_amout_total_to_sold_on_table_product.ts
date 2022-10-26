import {MigrationInterface, QueryRunner} from "typeorm";

export class renameColumnFromAmoutTotalToSoldOnTableProduct1664206494152 implements MigrationInterface {
    name = 'renameColumnFromAmoutTotalToSoldOnTableProduct1664206494152'

    public async up(queryRunner: QueryRunner): Promise<void> {
        
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "amout_total"`);
        await queryRunner.query(`ALTER TABLE "products" ADD "sold" numeric(12,4) NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "sold"`);
        await queryRunner.query(`ALTER TABLE "products" ADD "amout_total" numeric(12,4) NOT NULL DEFAULT '0'`);
    }

}
