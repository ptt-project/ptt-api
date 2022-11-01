import {MigrationInterface, QueryRunner} from "typeorm";

export class alterWalletAndTransaction1667061527771 implements MigrationInterface {
    name = 'alterWalletAndTransaction1667061527771'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "wallet_transactions" ADD "fee" numeric(14,4) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "wallet_transactions" ADD "fee_rate" numeric(14,4) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "wallet_transactions" ADD "total" numeric(14,4) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "wallets" ALTER COLUMN "balance" TYPE numeric(14,4)`);
        await queryRunner.query(`ALTER TABLE "wallet_transaction_references" ALTER COLUMN "amount" TYPE numeric(14,4)`);
        await queryRunner.query(`ALTER TABLE "wallet_transactions" ALTER COLUMN "amount" TYPE numeric(14,4)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "wallet_transactions" ALTER COLUMN "amount" TYPE numeric(12,2)`);
        await queryRunner.query(`ALTER TABLE "wallet_transaction_references" ALTER COLUMN "amount" TYPE numeric(12,2)`);
        await queryRunner.query(`ALTER TABLE "wallets" ALTER COLUMN "balance" TYPE numeric(12,2)`);
        await queryRunner.query(`ALTER TABLE "wallet_transactions" DROP COLUMN "total"`);
        await queryRunner.query(`ALTER TABLE "wallet_transactions" DROP COLUMN "fee_rate"`);
        await queryRunner.query(`ALTER TABLE "wallet_transactions" DROP COLUMN "fee"`);
    }

}
