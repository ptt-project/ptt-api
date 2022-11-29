import {MigrationInterface, QueryRunner} from "typeorm";

export class alterOrderShopAndWalletTransaction1667661489412 implements MigrationInterface {
    name = 'alterOrderShopAndWalletTransaction1667661489412'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_shops" ADD "wallet_transaction_id" uuid`);
        await queryRunner.query(`ALTER TABLE "order_shops" ADD CONSTRAINT "UQ_f085c1c2b07b9ab6da135611021" UNIQUE ("wallet_transaction_id")`);
        await queryRunner.query(`ALTER TABLE "wallet_transactions" ADD "order_shop_id" uuid`);
        await queryRunner.query(`ALTER TABLE "wallet_transactions" ADD CONSTRAINT "UQ_8481fd9814ea983ee2bbecc5d39" UNIQUE ("order_shop_id")`);
        await queryRunner.query(`ALTER TABLE "order_shops" ADD CONSTRAINT "FK_f085c1c2b07b9ab6da135611021" FOREIGN KEY ("wallet_transaction_id") REFERENCES "wallet_transactions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wallet_transactions" ADD CONSTRAINT "FK_8481fd9814ea983ee2bbecc5d39" FOREIGN KEY ("order_shop_id") REFERENCES "order_shops"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "wallet_transactions" DROP CONSTRAINT "FK_8481fd9814ea983ee2bbecc5d39"`);
        await queryRunner.query(`ALTER TABLE "order_shops" DROP CONSTRAINT "FK_f085c1c2b07b9ab6da135611021"`);
        await queryRunner.query(`ALTER TABLE "wallet_transactions" DROP CONSTRAINT "UQ_8481fd9814ea983ee2bbecc5d39"`);
        await queryRunner.query(`ALTER TABLE "wallet_transactions" DROP COLUMN "order_shop_id"`);
        await queryRunner.query(`ALTER TABLE "order_shops" DROP CONSTRAINT "UQ_f085c1c2b07b9ab6da135611021"`);
        await queryRunner.query(`ALTER TABLE "order_shops" DROP COLUMN "wallet_transaction_id"`);
    }

}
