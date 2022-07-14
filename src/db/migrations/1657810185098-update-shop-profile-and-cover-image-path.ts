import {MigrationInterface, QueryRunner} from "typeorm";

export class updateShopProfileAndCoverImagePath1657810185098 implements MigrationInterface {
    name = 'updateShopProfileAndCoverImagePath1657810185098'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shops" ADD "profile_image_path" character varying`);
        await queryRunner.query(`ALTER TABLE "shops" ADD "cover_image_path" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shops" DROP COLUMN "cover_image_path"`);
        await queryRunner.query(`ALTER TABLE "shops" DROP COLUMN "profile_image_path"`);
    }

}
