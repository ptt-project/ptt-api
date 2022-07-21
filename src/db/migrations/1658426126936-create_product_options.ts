import {MigrationInterface, QueryRunner} from "typeorm";

export class createProductOptions1658426126936 implements MigrationInterface {
    name = 'createProductOptions1658426126936'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "product_options" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "product_profile_id" integer NOT NULL, "options" text NOT NULL, CONSTRAINT "PK_3916b02fb43aa725f8167c718e4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "product_options" ADD CONSTRAINT "FK_8624051c26c6f9b9c8d16b3c65b" FOREIGN KEY ("product_profile_id") REFERENCES "product_profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_options" DROP CONSTRAINT "FK_8624051c26c6f9b9c8d16b3c65b"`);
        await queryRunner.query(`DROP TABLE "product_options"`);
    }

}
