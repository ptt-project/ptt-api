import {MigrationInterface, QueryRunner} from "typeorm";

export class updatePromotionProduct1665853458420 implements MigrationInterface {
    name = 'updatePromotionProduct1665853458420'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."product_promotions_discount_type_enum" AS ENUM('value', 'percentage')`);
        await queryRunner.query(`CREATE TABLE "product_promotions" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "promotion_id" integer NOT NULL, "product_profile_id" integer NOT NULL, "product_id" integer NOT NULL, "discount_type" "public"."product_promotions_discount_type_enum" NOT NULL DEFAULT 'value', "discount" numeric(9,4) NOT NULL, "price" numeric(14,4) NOT NULL, "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_fa71b2890eb1106b95abd706901" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "product_promotions" ADD CONSTRAINT "FK_f172d00c730ca8aeeb377846dee" FOREIGN KEY ("promotion_id") REFERENCES "promotions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_promotions" DROP CONSTRAINT "FK_f172d00c730ca8aeeb377846dee"`);
        await queryRunner.query(`DROP TABLE "product_promotions"`);
        await queryRunner.query(`DROP TYPE "public"."product_promotions_discount_type_enum"`);
    }

}
