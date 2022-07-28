import {MigrationInterface, QueryRunner} from "typeorm";

export class createCategory1657968054519 implements MigrationInterface {
    name = 'createCategory1657968054519'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."categories_created_by_enum" AS ENUM('seller', 'admin')`);
        await queryRunner.query(`CREATE TYPE "public"."categories_status_enum" AS ENUM('active', 'inactive')`);
        await queryRunner.query(`CREATE TABLE "categories" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "shop_id" integer NOT NULL, "name" character varying(40) NOT NULL, "created_by" "public"."categories_created_by_enum" NOT NULL, "status" "public"."categories_status_enum" NOT NULL DEFAULT 'inactive', "product_count" integer NOT NULL DEFAULT '0', "priority" integer NOT NULL, CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "categories" ADD CONSTRAINT "FK_b7782b67d6bffd48a980289eee1" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "FK_b7782b67d6bffd48a980289eee1"`);
        await queryRunner.query(`DROP TABLE "categories"`);
        await queryRunner.query(`DROP TYPE "public"."categories_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."categories_created_by_enum"`);
    }

}
