import {MigrationInterface, QueryRunner} from "typeorm";

export class editNullableInProductProfiles1658502373095 implements MigrationInterface {
    name = 'editNullableInProductProfiles1658502373095'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_profiles" ALTER COLUMN "exp" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_profiles" ALTER COLUMN "condition" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_profiles" ALTER COLUMN "is_send_lated" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_profiles" ALTER COLUMN "extra_day" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_profiles" ALTER COLUMN "video_link" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_profiles" ALTER COLUMN "image_ids" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_profiles" ALTER COLUMN "watched" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_profiles" ALTER COLUMN "like" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_profiles" ALTER COLUMN "like" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_profiles" ALTER COLUMN "watched" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_profiles" ALTER COLUMN "image_ids" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_profiles" ALTER COLUMN "video_link" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_profiles" ALTER COLUMN "extra_day" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_profiles" ALTER COLUMN "is_send_lated" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_profiles" ALTER COLUMN "condition" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_profiles" ALTER COLUMN "exp" SET NOT NULL`);
    }

}
