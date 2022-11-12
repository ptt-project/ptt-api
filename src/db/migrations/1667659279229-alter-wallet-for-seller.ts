import {MigrationInterface, QueryRunner} from "typeorm";

export class alterWalletForSeller1667659279229 implements MigrationInterface {
    name = 'alterWalletForSeller1667659279229'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shops" ADD "wallet_id" uuid`);
        await queryRunner.query(`ALTER TABLE "shops" ADD CONSTRAINT "UQ_02966d0b3db293a4962e4b088d9" UNIQUE ("wallet_id")`);
        await queryRunner.query(`ALTER TABLE "wallets" ADD "shop_id" uuid`);
        await queryRunner.query(`ALTER TABLE "wallets" ADD CONSTRAINT "UQ_9aeb801cefd8d393a1d074ef882" UNIQUE ("shop_id")`);
        await queryRunner.query(`ALTER TABLE "shops" ADD CONSTRAINT "FK_02966d0b3db293a4962e4b088d9" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wallets" ADD CONSTRAINT "FK_9aeb801cefd8d393a1d074ef882" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "wallets" DROP CONSTRAINT "FK_9aeb801cefd8d393a1d074ef882"`);
        await queryRunner.query(`ALTER TABLE "shops" DROP CONSTRAINT "FK_02966d0b3db293a4962e4b088d9"`);
        await queryRunner.query(`ALTER TABLE "wallets" DROP CONSTRAINT "UQ_9aeb801cefd8d393a1d074ef882"`);
        await queryRunner.query(`ALTER TABLE "wallets" DROP COLUMN "shop_id"`);
        await queryRunner.query(`ALTER TABLE "shops" DROP CONSTRAINT "UQ_02966d0b3db293a4962e4b088d9"`);
        await queryRunner.query(`ALTER TABLE "shops" DROP COLUMN "wallet_id"`);
    }

}
