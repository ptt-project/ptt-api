import {MigrationInterface, QueryRunner} from "typeorm";

export class updateWalletAndTransaction1662486308915 implements MigrationInterface {
    name = 'updateWalletAndTransaction1662486308915'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "wallet_transaction_references" RENAME COLUMN "gbp_reference_no" TO "third_pt_reference_no"`);
        await queryRunner.query(`CREATE TYPE "public"."wallet_transactions_note_enum" AS ENUM('credit', 'debit')`);
        await queryRunner.query(`ALTER TABLE "wallet_transactions" ADD "note" "public"."wallet_transactions_note_enum" NOT NULL`);
        await queryRunner.query(`ALTER TYPE "public"."wallet_transactions_type_enum" RENAME TO "wallet_transactions_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."wallet_transactions_type_enum" AS ENUM('deposit', 'withdraw', 'buy', 'sell', 'buy_happy_point', 'sell_happy_point')`);
        await queryRunner.query(`ALTER TABLE "wallet_transactions" ALTER COLUMN "type" TYPE "public"."wallet_transactions_type_enum" USING "type"::"text"::"public"."wallet_transactions_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."wallet_transactions_type_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."wallet_transactions_type_enum_old" AS ENUM('deposit', 'withdraw', 'buy', 'sell')`);
        await queryRunner.query(`ALTER TABLE "wallet_transactions" ALTER COLUMN "type" TYPE "public"."wallet_transactions_type_enum_old" USING "type"::"text"::"public"."wallet_transactions_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."wallet_transactions_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."wallet_transactions_type_enum_old" RENAME TO "wallet_transactions_type_enum"`);
        await queryRunner.query(`ALTER TABLE "wallet_transactions" DROP COLUMN "note"`);
        await queryRunner.query(`DROP TYPE "public"."wallet_transactions_note_enum"`);
        await queryRunner.query(`ALTER TABLE "wallet_transaction_references" RENAME COLUMN "third_pt_reference_no" TO "gbp_reference_no"`);
    }

}
