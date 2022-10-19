import {MigrationInterface, QueryRunner} from "typeorm";

export class updateBackAccountTransaction1662261554330 implements MigrationInterface {
    name = 'updateBackAccountTransaction1662261554330'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "wallet_transactions" ADD "bank_account_id" integer`);
        await queryRunner.query(`ALTER TABLE "wallet_transactions" ADD CONSTRAINT "FK_2aaa023ad7b82f9a14980b2cf57" FOREIGN KEY ("bank_account_id") REFERENCES "bank_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "wallet_transactions" DROP CONSTRAINT "FK_2aaa023ad7b82f9a14980b2cf57"`);
        await queryRunner.query(`ALTER TABLE "wallet_transactions" DROP COLUMN "bank_account_id"`);
    }

}
