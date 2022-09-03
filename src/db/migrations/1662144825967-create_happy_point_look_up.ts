import {MigrationInterface, QueryRunner} from "typeorm";

export class createHappyPointLookUp1662144825967 implements MigrationInterface {
    name = 'createHappyPointLookUp1662144825967'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "happy_point_look_up" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "ref_id" character varying NOT NULL, "exchange_rate" numeric(12,4) NOT NULL DEFAULT '0', "member_id" integer NOT NULL, CONSTRAINT "PK_ff2c43b9fb91d3e84d760078f93" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_2bfd1a8cc1ba4037f79deb6f65" ON "happy_point_look_up" ("ref_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_2bfd1a8cc1ba4037f79deb6f65"`);
        await queryRunner.query(`DROP TABLE "happy_point_look_up"`);
    }

}
