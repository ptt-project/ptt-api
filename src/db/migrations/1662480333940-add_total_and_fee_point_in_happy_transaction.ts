import {MigrationInterface, QueryRunner} from "typeorm";

export class addTotalAndFeePointInHappyTransaction1662480333940 implements MigrationInterface {
    name = 'addTotalAndFeePointInHappyTransaction1662480333940'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "happy_point_transactions" ADD "total_point" numeric(12,4)`);
        await queryRunner.query(`ALTER TABLE "happy_point_transactions" ADD "fee_point" numeric(12,4) DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "happy_point_transactions" DROP COLUMN "fee_point"`);
        await queryRunner.query(`ALTER TABLE "happy_point_transactions" DROP COLUMN "total_point"`);
    }

}
