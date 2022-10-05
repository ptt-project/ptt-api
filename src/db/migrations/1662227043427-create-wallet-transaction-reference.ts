import {MigrationInterface, QueryRunner} from "typeorm";

export class createWalletTransactionReference1662227043427 implements MigrationInterface {
    name = 'createWalletTransactionReference1662227043427'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "wallet_transaction_references" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "transaction_id" integer NOT NULL, "result_code" character varying, "reference_no" character varying NOT NULL, "gbp_reference_no" character varying, "amount" numeric(12,2) NOT NULL DEFAULT '0', "detail" character varying, CONSTRAINT "REL_ea00ed490bc29165edad6c0e60" UNIQUE ("transaction_id"), CONSTRAINT "PK_f4147b4a01bf01f2233eec8b732" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "wallet_transactions" ADD "reference_id" integer`);
        await queryRunner.query(`ALTER TABLE "wallet_transactions" ADD CONSTRAINT "UQ_fb28735205a7021d74c61d7bd2d" UNIQUE ("reference_id")`);
        await queryRunner.query(`ALTER TABLE "wallet_transaction_references" ADD CONSTRAINT "FK_ea00ed490bc29165edad6c0e60b" FOREIGN KEY ("transaction_id") REFERENCES "wallet_transactions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wallet_transactions" ADD CONSTRAINT "FK_fb28735205a7021d74c61d7bd2d" FOREIGN KEY ("reference_id") REFERENCES "wallet_transaction_references"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "wallet_transactions" DROP CONSTRAINT "FK_fb28735205a7021d74c61d7bd2d"`);
        await queryRunner.query(`ALTER TABLE "wallet_transaction_references" DROP CONSTRAINT "FK_ea00ed490bc29165edad6c0e60b"`);
        await queryRunner.query(`ALTER TABLE "wallet_transactions" DROP CONSTRAINT "UQ_fb28735205a7021d74c61d7bd2d"`);
        await queryRunner.query(`ALTER TABLE "wallet_transactions" DROP COLUMN "reference_id"`);
        await queryRunner.query(`DROP TABLE "wallet_transaction_references"`);
    }

}
