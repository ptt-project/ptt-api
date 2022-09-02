import {MigrationInterface, QueryRunner} from "typeorm";

export class addTableExchangeRatesAndTableExchangeRateTransactions1662140584687 implements MigrationInterface {
    name = 'addTableExchangeRatesAndTableExchangeRateTransactions1662140584687'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "exchange_rate_transactions" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "old_exchange_rate" numeric(12,4) NOT NULL DEFAULT '0', "new_exchange_rate" numeric(12,4) NOT NULL DEFAULT '0', CONSTRAINT "PK_bdd328c3c9426b8afd2022f19bd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "exchange_rates" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "exchange_rate" numeric(12,4) NOT NULL DEFAULT '0', CONSTRAINT "PK_33a614bad9e61956079d817ebe2" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "exchange_rates"`);
        await queryRunner.query(`DROP TABLE "exchange_rate_transactions"`);
    }

}
