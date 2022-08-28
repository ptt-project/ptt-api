import {MigrationInterface, QueryRunner} from "typeorm";

export class updateMallShopRegister1660655468321 implements MigrationInterface {
    name = 'updateMallShopRegister1660655468321'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."shops_mall_applicant_role_enum" AS ENUM('Brand Owner', 'Exclusive Distributor', 'Non-Exclusive Distributor', 'Retailer', 'Other')`);
        await queryRunner.query(`ALTER TABLE "shops" ADD "mall_applicant_role" "public"."shops_mall_applicant_role_enum"`);
        await queryRunner.query(`ALTER TABLE "shops" ADD "mall_offline_shop_detail" character varying`);
        await queryRunner.query(`ALTER TABLE "shops" ADD "mall_shop_description" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shops" DROP COLUMN "mall_shop_description"`);
        await queryRunner.query(`ALTER TABLE "shops" DROP COLUMN "mall_offline_shop_detail"`);
        await queryRunner.query(`ALTER TABLE "shops" DROP COLUMN "mall_applicant_role"`);
        await queryRunner.query(`DROP TYPE "public"."shops_mall_applicant_role_enum"`);
    }

}
