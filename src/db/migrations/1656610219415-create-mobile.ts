import {MigrationInterface, QueryRunner} from "typeorm";

export class createMobile1656610219415 implements MigrationInterface {
    name = 'createMobile1656610219415'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "mobiles" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "mobile" character varying(20) NOT NULL, "is_primary" boolean NOT NULL DEFAULT false, "memberId" integer, CONSTRAINT "PK_59ee2365f347e4709b04279bfdb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "mobiles" ADD CONSTRAINT "FK_934c5580604085656049371ca74" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mobiles" DROP CONSTRAINT "FK_934c5580604085656049371ca74"`);
        await queryRunner.query(`DROP TABLE "mobiles"`);
    }

}
