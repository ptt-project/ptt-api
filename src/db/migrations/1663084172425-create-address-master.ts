import {MigrationInterface, QueryRunner} from "typeorm";

export class createAddressMaster1663084172425 implements MigrationInterface {
    name = 'createAddressMaster1663084172425'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "address_masters" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "data" text NOT NULL, CONSTRAINT "PK_357b75ea36d3463f578c58bd607" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "address_masters"`);
    }

}
