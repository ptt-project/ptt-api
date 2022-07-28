import {MigrationInterface, QueryRunner} from "typeorm";

export class createShop1657388191389 implements MigrationInterface {
    name = 'createShop1657388191389'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."shops_type_enum" AS ENUM('Normal', 'Mall')`);
        await queryRunner.query(`CREATE TYPE "public"."shops_approval_status_enum" AS ENUM('requested', 'rejected', 'approved')`);
        await queryRunner.query(`CREATE TABLE "shops" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "type" "public"."shops_type_enum" NOT NULL DEFAULT 'Normal', "full_name" character varying(50) NOT NULL, "mobile" character varying(10), "email" character varying(50) NOT NULL, "brand_name" character varying(50) NOT NULL, "category" character varying(50) NOT NULL, "website" character varying(50), "facebook_page" character varying(50), "instagram" character varying(50), "social_media" character varying(200), "note" character varying(1000), "corperate_name" character varying(50), "corperate_id" character varying(20), "approval_status" "public"."shops_approval_status_enum" NOT NULL DEFAULT 'requested', "member_id" integer, CONSTRAINT "REL_351c6aa0db45eab2b127b4dab1" UNIQUE ("member_id"), CONSTRAINT "PK_3c6aaa6607d287de99815e60b96" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "shops" ADD CONSTRAINT "FK_351c6aa0db45eab2b127b4dab17" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shops" DROP CONSTRAINT "FK_351c6aa0db45eab2b127b4dab17"`);
        await queryRunner.query(`DROP TABLE "shops"`);
        await queryRunner.query(`DROP TYPE "public"."shops_approval_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."shops_type_enum"`);
    }

}
