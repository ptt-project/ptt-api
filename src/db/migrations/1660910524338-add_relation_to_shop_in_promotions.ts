import {MigrationInterface, QueryRunner} from "typeorm";

export class addRelationToShopInPromotions1660910524338 implements MigrationInterface {
    name = 'addRelationToShopInPromotions1660910524338'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "promotions" ADD "shop_id" integer`);
        await queryRunner.query(`ALTER TABLE "promotions" ADD CONSTRAINT "FK_81f10b75028c915e869b88d7a12" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "promotions" DROP CONSTRAINT "FK_81f10b75028c915e869b88d7a12"`);
        await queryRunner.query(`ALTER TABLE "promotions" DROP COLUMN "shop_id"`);
    }

}
