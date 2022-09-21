import {MigrationInterface, QueryRunner} from "typeorm";

export class addFeeRateToHappyPointLookup1662718740204 implements MigrationInterface {
    name = 'addFeeRateToHappyPointLookup1662718740204'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "happy_point_look_up" ADD "fee_point_rate" numeric(12,4) DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "happy_point_look_up" ADD "fee_amount_rate" numeric(12,4) DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "happy_point_look_up" DROP COLUMN "fee_amount_rate"`);
        await queryRunner.query(`ALTER TABLE "happy_point_look_up" DROP COLUMN "fee_point_rate"`);
    }

}
