import {MigrationInterface, QueryRunner} from "typeorm";

export class updateFlashSale1665857757106 implements MigrationInterface {
    name = 'updateFlashSale1665857757106'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "flash_sale_products" DROP CONSTRAINT "FK_05185c7e101ef036beeee661cdb"`);
        await queryRunner.query(`ALTER TABLE "flash_sale_products" DROP COLUMN "product_profile_id"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "flash_sale_products" ADD "product_profile_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "flash_sale_products" ADD CONSTRAINT "FK_05185c7e101ef036beeee661cdb" FOREIGN KEY ("product_profile_id") REFERENCES "product_profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
