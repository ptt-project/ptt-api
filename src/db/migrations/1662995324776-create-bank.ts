import {MigrationInterface, QueryRunner} from "typeorm";

export class createBank1662995324776 implements MigrationInterface {
    name = 'createBank1662995324776'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "banks" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "bank_code" character varying NOT NULL, "name" character varying NOT NULL, CONSTRAINT "UQ_824dd9d33e9228917f28fc6e052" UNIQUE ("bank_code"), CONSTRAINT "PK_3975b5f684ec241e3901db62d77" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "banks"`);
    }

}
