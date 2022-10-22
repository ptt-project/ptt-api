import {MigrationInterface, QueryRunner} from "typeorm";

export class updatePromotionProductRelation1665856812591 implements MigrationInterface {
    name = 'updatePromotionProductRelation1665856812591'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_promotions" DROP COLUMN "product_profile_id"`);
        await queryRunner.query(`ALTER TABLE "product_promotions" ADD CONSTRAINT "FK_c543a540feaa54216f5880ab9d6" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_promotions" DROP CONSTRAINT "FK_c543a540feaa54216f5880ab9d6"`);
        await queryRunner.query(`ALTER TABLE "product_promotions" ADD "product_profile_id" integer NOT NULL`);
    }

}
