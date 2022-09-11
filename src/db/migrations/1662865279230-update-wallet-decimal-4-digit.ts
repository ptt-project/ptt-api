import {MigrationInterface, QueryRunner} from "typeorm";

export class updateWalletDecimal4Digit1662865279230 implements MigrationInterface {
    name = 'updateWalletDecimal4Digit1662865279230'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "wallets" ALTER COLUMN "balance" TYPE numeric(14,4)`);
        await queryRunner.query(`ALTER TABLE "wallet_transaction_references" ALTER COLUMN "amount" TYPE numeric(14,4)`);
        await queryRunner.query(`ALTER TABLE "wallet_transactions" ALTER COLUMN "amount" TYPE numeric(14,4)`);
        await queryRunner.query(`ALTER TABLE "wallet_transactions" ALTER COLUMN "fee" TYPE numeric(14,4)`);
        await queryRunner.query(`ALTER TABLE "wallet_transactions" ALTER COLUMN "fee_rate" TYPE numeric(14,4)`);
        await queryRunner.query(`ALTER TABLE "wallet_transactions" ALTER COLUMN "total" TYPE numeric(14,4)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "wallet_transactions" ALTER COLUMN "total" TYPE numeric(12,4)`);
        await queryRunner.query(`ALTER TABLE "wallet_transactions" ALTER COLUMN "fee_rate" TYPE numeric(12,4)`);
        await queryRunner.query(`ALTER TABLE "wallet_transactions" ALTER COLUMN "fee" TYPE numeric(12,4)`);
        await queryRunner.query(`ALTER TABLE "wallet_transactions" ALTER COLUMN "amount" TYPE numeric(12,4)`);
        await queryRunner.query(`ALTER TABLE "wallet_transaction_references" ALTER COLUMN "amount" TYPE numeric(12,4)`);
        await queryRunner.query(`ALTER TABLE "wallets" ALTER COLUMN "balance" TYPE numeric(12,2)`);
    }

}
