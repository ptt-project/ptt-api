import {MigrationInterface, QueryRunner} from "typeorm";

export class updatePromotionProductShopId1665854536949 implements MigrationInterface {
    name = 'updatePromotionProductShopId1665854536949'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "promotions" DROP COLUMN "shopId"`);
        await queryRunner.query(`ALTER TABLE "promotions" DROP CONSTRAINT "FK_81f10b75028c915e869b88d7a12"`);
        await queryRunner.query(`ALTER TABLE "promotions" ALTER COLUMN "shop_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "promotions" ADD CONSTRAINT "FK_81f10b75028c915e869b88d7a12" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "promotions" DROP CONSTRAINT "FK_81f10b75028c915e869b88d7a12"`);
        await queryRunner.query(`ALTER TABLE "promotions" ALTER COLUMN "shop_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "promotions" ADD CONSTRAINT "FK_81f10b75028c915e869b88d7a12" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "promotions" ADD "shopId" integer NOT NULL`);
    }

}
