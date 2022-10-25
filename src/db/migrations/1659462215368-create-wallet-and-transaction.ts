import {MigrationInterface, QueryRunner} from "typeorm";

export class createWalletAndTransaction1659462215368 implements MigrationInterface {
    name = 'createWalletAndTransaction1659462215368'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."wallet_transactions_type_enum" AS ENUM('deposit', 'withdraw', 'buy', 'sell')`);
        await queryRunner.query(`CREATE TYPE "public"."wallet_transactions_status_enum" AS ENUM('success', 'fail', 'cancel', 'pending')`);
        await queryRunner.query(`CREATE TABLE "wallet_transactions" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "wallet_id" integer NOT NULL, "type" "public"."wallet_transactions_type_enum" NOT NULL, "amount" numeric(12,2) NOT NULL DEFAULT '0', "detail" character varying, "status" "public"."wallet_transactions_status_enum" NOT NULL, CONSTRAINT "PK_5120f131bde2cda940ec1a621db" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "wallets" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "member_id" integer NOT NULL, "balance" numeric(12,2) NOT NULL DEFAULT '0', CONSTRAINT "PK_8402e5df5a30a229380e83e4f7e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "wallet_transactions" ADD CONSTRAINT "FK_c57d19129968160f4db28fc8b28" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wallets" ADD CONSTRAINT "FK_2ffeef1faa59259246b070f626a" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "wallets" DROP CONSTRAINT "FK_2ffeef1faa59259246b070f626a"`);
        await queryRunner.query(`ALTER TABLE "wallet_transactions" DROP CONSTRAINT "FK_c57d19129968160f4db28fc8b28"`);
        await queryRunner.query(`DROP TABLE "wallets"`);
        await queryRunner.query(`DROP TABLE "wallet_transactions"`);
        await queryRunner.query(`DROP TYPE "public"."wallet_transactions_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."wallet_transactions_type_enum"`);
    }

}
