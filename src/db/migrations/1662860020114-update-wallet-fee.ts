import {MigrationInterface, QueryRunner} from "typeorm";

export class updateWalletFee1662860020114 implements MigrationInterface {
    name = 'updateWalletFee1662860020114'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "wallet_transactions" ADD "fee" numeric(12,4) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "wallet_transactions" ADD "fee_rate" numeric(12,4) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "wallet_transactions" ADD "total" numeric(12,4) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "wallet_transaction_references" ALTER COLUMN "amount" TYPE numeric(12,4)`);
        await queryRunner.query(`ALTER TABLE "wallet_transactions" ALTER COLUMN "amount" TYPE numeric(12,4)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "wallet_transactions" ALTER COLUMN "amount" TYPE numeric(12,2)`);
        await queryRunner.query(`ALTER TABLE "wallet_transaction_references" ALTER COLUMN "amount" TYPE numeric(12,2)`);
        await queryRunner.query(`ALTER TABLE "wallet_transactions" DROP COLUMN "total"`);
        await queryRunner.query(`ALTER TABLE "wallet_transactions" DROP COLUMN "fee_rate"`);
        await queryRunner.query(`ALTER TABLE "wallet_transactions" DROP COLUMN "fee"`);
    }

}
