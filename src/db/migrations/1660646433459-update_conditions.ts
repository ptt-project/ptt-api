import {MigrationInterface, QueryRunner} from "typeorm";

export class updateConditions1660646433459 implements MigrationInterface {
    name = 'updateConditions1660646433459'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "conditions" ALTER COLUMN "count_person" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "conditions" ALTER COLUMN "count_person_status" SET DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "conditions" ALTER COLUMN "count_order" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "conditions" ALTER COLUMN "count_order_status" SET DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "conditions" ALTER COLUMN "total_sale" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "conditions" ALTER COLUMN "total_sale_status" SET DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "conditions" ALTER COLUMN "score_rate" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "conditions" ALTER COLUMN "score_rate_status" SET DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "conditions" ALTER COLUMN "failed_order_rate" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "conditions" ALTER COLUMN "failed_order_rate_status" SET DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "conditions" ALTER COLUMN "delayed_delivery_rate" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "conditions" ALTER COLUMN "delayed_delivery_rate_status" SET DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "conditions" ALTER COLUMN "delayed_delivery_rate_status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "conditions" ALTER COLUMN "delayed_delivery_rate" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "conditions" ALTER COLUMN "failed_order_rate_status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "conditions" ALTER COLUMN "failed_order_rate" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "conditions" ALTER COLUMN "score_rate_status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "conditions" ALTER COLUMN "score_rate" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "conditions" ALTER COLUMN "total_sale_status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "conditions" ALTER COLUMN "total_sale" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "conditions" ALTER COLUMN "count_order_status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "conditions" ALTER COLUMN "count_order" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "conditions" ALTER COLUMN "count_person_status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "conditions" ALTER COLUMN "count_person" DROP DEFAULT`);
    }

}
