import {MigrationInterface, QueryRunner} from "typeorm";

export class createMembers1655918775925 implements MigrationInterface {
    name = 'createMembers1655918775925'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "members" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "username" character varying(50) NOT NULL, "firstname" character varying(50) NOT NULL, "lastname" character varying(50) NOT NULL, "password" character varying NOT NULL, "mobile" character varying(20), "pdpa_status" boolean, "birthday" TIMESTAMP, "gender" "public"."members_gender_enum" NOT NULL, "spCodeId" integer, CONSTRAINT "REL_451ec90fdd6b43f529e1dd0c08" UNIQUE ("spCodeId"), CONSTRAINT "PK_28b53062261b996d9c99fa12404" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "members" ADD CONSTRAINT "FK_451ec90fdd6b43f529e1dd0c085" FOREIGN KEY ("spCodeId") REFERENCES "members"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "members" DROP CONSTRAINT "FK_451ec90fdd6b43f529e1dd0c085"`);
        await queryRunner.query(`DROP TABLE "members"`);
    }

}
