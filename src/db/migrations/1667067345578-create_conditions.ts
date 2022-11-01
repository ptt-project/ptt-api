import {MigrationInterface, QueryRunner} from "typeorm";

export class createConditions1667067345578 implements MigrationInterface {
    name = 'createConditions1667067345578'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "conditions" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "shop_id" uuid NOT NULL, "count_person" integer NOT NULL DEFAULT '0', "count_person_status" boolean NOT NULL DEFAULT false, "count_order" integer NOT NULL DEFAULT '0', "count_order_status" boolean NOT NULL DEFAULT false, "total_sale" integer NOT NULL DEFAULT '0', "total_sale_status" boolean NOT NULL DEFAULT false, "score_rate" integer NOT NULL DEFAULT '0', "score_rate_status" boolean NOT NULL DEFAULT false, "failed_order_rate" integer NOT NULL DEFAULT '0', "failed_order_rate_status" boolean NOT NULL DEFAULT false, "delayed_delivery_rate" integer NOT NULL DEFAULT '0', "delayed_delivery_rate_status" boolean NOT NULL DEFAULT false, CONSTRAINT "REL_762403f357052d2313308ba927" UNIQUE ("shop_id"), CONSTRAINT "PK_3938bdf2933c08ac7af7e0e15e7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "shops" ADD "condition_id" uuid`);
        await queryRunner.query(`ALTER TABLE "shops" ADD CONSTRAINT "UQ_a0a279b76438a3cb32f9723849a" UNIQUE ("condition_id")`);
        await queryRunner.query(`ALTER TABLE "conditions" ADD CONSTRAINT "FK_762403f357052d2313308ba9273" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "shops" ADD CONSTRAINT "FK_a0a279b76438a3cb32f9723849a" FOREIGN KEY ("condition_id") REFERENCES "conditions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shops" DROP CONSTRAINT "FK_a0a279b76438a3cb32f9723849a"`);
        await queryRunner.query(`ALTER TABLE "conditions" DROP CONSTRAINT "FK_762403f357052d2313308ba9273"`);
        await queryRunner.query(`ALTER TABLE "shops" DROP CONSTRAINT "UQ_a0a279b76438a3cb32f9723849a"`);
        await queryRunner.query(`ALTER TABLE "shops" DROP COLUMN "condition_id"`);
        await queryRunner.query(`DROP TABLE "conditions"`);
    }

}
