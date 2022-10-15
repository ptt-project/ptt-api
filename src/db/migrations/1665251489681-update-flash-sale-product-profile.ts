import {MigrationInterface, QueryRunner} from "typeorm";

export class updateFlashSaleProductProfile1665251489681 implements MigrationInterface {
    name = 'updateFlashSaleProductProfile1665251489681'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "flash_sale_product_profiles" ADD CONSTRAINT "FK_779a6bbd04c935f91303167c495" FOREIGN KEY ("product_profile_id") REFERENCES "product_profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "flash_sale_product_profiles" DROP CONSTRAINT "FK_779a6bbd04c935f91303167c495"`);
    }

}
