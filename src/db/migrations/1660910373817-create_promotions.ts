import {MigrationInterface, QueryRunner} from "typeorm";

export class createPromotions1660910373817 implements MigrationInterface {
    name = 'createPromotions1660910373817'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."promotions_status_enum" AS ENUM('coming soon', 'expired', 'active')`);
        await queryRunner.query(`CREATE TABLE "promotions" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "shopId" integer NOT NULL, "name" character varying NOT NULL, "status" "public"."promotions_status_enum" NOT NULL DEFAULT 'coming soon', "start_date" TIMESTAMP NOT NULL, "end_date" TIMESTAMP NOT NULL, CONSTRAINT "PK_380cecbbe3ac11f0e5a7c452c34" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "promotions"`);
        await queryRunner.query(`DROP TYPE "public"."promotions_status_enum"`);
    }

}
