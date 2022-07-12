import {MigrationInterface, QueryRunner} from "typeorm";

export class addDefaultValueToFlagInAddresses1657634167517 implements MigrationInterface {
    name = 'addDefaultValueToFlagInAddresses1657634167517'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "addresses" ALTER COLUMN "is_main" SET DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "addresses" ALTER COLUMN "is_home" SET DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "addresses" ALTER COLUMN "is_work" SET DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "addresses" ALTER COLUMN "is_pickup" SET DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "addresses" ALTER COLUMN "is_return_item" SET DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "addresses" ALTER COLUMN "is_return_item" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "addresses" ALTER COLUMN "is_pickup" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "addresses" ALTER COLUMN "is_work" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "addresses" ALTER COLUMN "is_home" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "addresses" ALTER COLUMN "is_main" DROP DEFAULT`);
    }

}
