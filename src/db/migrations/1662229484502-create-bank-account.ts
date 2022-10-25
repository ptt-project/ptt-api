import {MigrationInterface, QueryRunner} from "typeorm";

export class createBankAccount1662229484502 implements MigrationInterface {
    name = 'createBankAccount1662229484502'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "bank_accounts" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "member_id" integer NOT NULL, "full_name" character varying NOT NULL, "thai_id" character varying NOT NULL, "bank_code" character varying NOT NULL, "account_number" character varying NOT NULL, "account_holder" character varying NOT NULL, "is_main" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_c872de764f2038224a013ff25ed" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "bank_accounts" ADD CONSTRAINT "FK_e7a98880639f2a2a4ffd91e0e25" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bank_accounts" DROP CONSTRAINT "FK_e7a98880639f2a2a4ffd91e0e25"`);
        await queryRunner.query(`DROP TABLE "bank_accounts"`);
    }

}
