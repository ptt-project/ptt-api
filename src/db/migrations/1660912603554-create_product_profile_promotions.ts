import {MigrationInterface, QueryRunner} from "typeorm";

export class createProductProfilePromotions1660912603554 implements MigrationInterface {
    name = 'createProductProfilePromotions1660912603554'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."product_profile_promotions_discount_type_enum" AS ENUM('value', 'percentage')`);
        await queryRunner.query(`CREATE TABLE "product_profile_promotions" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "promotion_id" integer NOT NULL, "product_profile_id" integer NOT NULL, "discount_type" "public"."product_profile_promotions_discount_type_enum" NOT NULL DEFAULT 'value', "discount" numeric(5,4) NOT NULL, "limit_to_stock" integer NOT NULL, "limit_to_buy" integer NOT NULL, "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_811db547978e77575cc4de3a977" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "product_profile_promotions" ADD CONSTRAINT "FK_6dee80098c7877d709271e00913" FOREIGN KEY ("promotion_id") REFERENCES "promotions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_profile_promotions" DROP CONSTRAINT "FK_6dee80098c7877d709271e00913"`);
        await queryRunner.query(`DROP TABLE "product_profile_promotions"`);
        await queryRunner.query(`DROP TYPE "public"."product_profile_promotions_discount_type_enum"`);
    }

}
