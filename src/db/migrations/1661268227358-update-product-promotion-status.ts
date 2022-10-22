import {MigrationInterface, QueryRunner} from "typeorm";

export class updateProductPromotionStatus1661268227358 implements MigrationInterface {
    name = 'updateProductPromotionStatus1661268227358'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "promotions" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."promotions_status_enum"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."promotions_status_enum" AS ENUM('coming soon', 'expired', 'active')`);
        await queryRunner.query(`ALTER TABLE "promotions" ADD "status" "public"."promotions_status_enum" NOT NULL DEFAULT 'coming soon'`);
    }

}
