import {MigrationInterface, QueryRunner} from "typeorm";

export class addFlagSellerInAddresses1657624659823 implements MigrationInterface {
    name = 'addFlagSellerInAddresses1657624659823'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "addresses" ADD "is_pickup" boolean`);
        await queryRunner.query(`ALTER TABLE "addresses" ADD "is_return_item" boolean`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "is_return_item"`);
        await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "is_pickup"`);
    }

}
