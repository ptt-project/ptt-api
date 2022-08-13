import {MigrationInterface, QueryRunner} from "typeorm";

export class createConditions1660132650327 implements MigrationInterface {
    name = 'createConditions1660132650327'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "conditions" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "shop_id" integer NOT NULL, "count_person" integer, "count_person_status" boolean, "count_order" integer, "count_order_status" boolean, "total_sale" integer, "total_sale_status" boolean, "score_rate" integer, "score_rate_status" boolean, "failed_order_rate" integer, "failed_order_rate_status" boolean, "delayed_delivery_rate" integer, "delayed_delivery_rate_status" boolean, CONSTRAINT "REL_762403f357052d2313308ba927" UNIQUE ("shop_id"), CONSTRAINT "PK_3938bdf2933c08ac7af7e0e15e7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "shops" ADD "shop_id" integer`);
        await queryRunner.query(`ALTER TABLE "shops" ADD CONSTRAINT "UQ_a1c960b70b4f013a3b57238b58d" UNIQUE ("shop_id")`);
        await queryRunner.query(`ALTER TABLE "conditions" ADD CONSTRAINT "FK_762403f357052d2313308ba9273" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "shops" ADD CONSTRAINT "FK_a1c960b70b4f013a3b57238b58d" FOREIGN KEY ("shop_id") REFERENCES "conditions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shops" DROP CONSTRAINT "FK_a1c960b70b4f013a3b57238b58d"`);
        await queryRunner.query(`ALTER TABLE "conditions" DROP CONSTRAINT "FK_762403f357052d2313308ba9273"`);
        await queryRunner.query(`ALTER TABLE "shops" DROP CONSTRAINT "UQ_a1c960b70b4f013a3b57238b58d"`);
        await queryRunner.query(`ALTER TABLE "shops" DROP COLUMN "shop_id"`);
        await queryRunner.query(`DROP TABLE "conditions"`);
    }

}
