import {MigrationInterface, QueryRunner} from "typeorm";

export class createMasterConfig1663354580507 implements MigrationInterface {
    name = 'createMasterConfig1663354580507'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "master_config" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "config" text DEFAULT '{}', CONSTRAINT "PK_4bba6d1e292c7e4f6afd7fac5e2" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "master_config"`);
    }

}
