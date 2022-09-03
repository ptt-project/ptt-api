import {MigrationInterface, QueryRunner} from "typeorm";

export class addExchangeRateInHappyPointTransaction1662228377792 implements MigrationInterface {
    name = 'addExchangeRateInHappyPointTransaction1662228377792'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "happy_point_transactions" ADD "exchange_rate" numeric(12,4) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "happy_point_transactions" ALTER COLUMN "fee" SET DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "happy_point_transactions" ALTER COLUMN "fee" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "happy_point_transactions" DROP COLUMN "exchange_rate"`);
    }

}
