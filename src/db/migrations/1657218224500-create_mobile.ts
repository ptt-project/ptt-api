import {MigrationInterface, QueryRunner} from "typeorm";

export class createMobile1657218224500 implements MigrationInterface {
    name = 'createMobile1657218224500'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "mobiles" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "member_id" integer NOT NULL, "mobile" character varying(20) NOT NULL, "is_primary" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_59ee2365f347e4709b04279bfdb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "mobiles" ADD CONSTRAINT "FK_68edc6728faaa0b394710209f7e" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mobiles" DROP CONSTRAINT "FK_68edc6728faaa0b394710209f7e"`);
        await queryRunner.query(`DROP TABLE "mobiles"`);
    }

}
