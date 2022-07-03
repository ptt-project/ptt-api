import {MigrationInterface, QueryRunner} from "typeorm";

export class createAddresses1656756215215 implements MigrationInterface {
    name = 'createAddresses1656756215215'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "addresses" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "member_id" integer NOT NULL, "province" character varying NOT NULL, "amphur" character varying NOT NULL, "district" character varying NOT NULL, "postcode" character varying(5) NOT NULL, "address" character varying, "geo_name" character varying, "is_main" boolean, "is_home" boolean, "is_work" boolean, CONSTRAINT "PK_745d8f43d3af10ab8247465e450" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "addresses" ADD CONSTRAINT "FK_72490966ef2345cee60e2031d8d" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "addresses" DROP CONSTRAINT "FK_72490966ef2345cee60e2031d8d"`);
        await queryRunner.query(`DROP TABLE "addresses"`);
    }

}
