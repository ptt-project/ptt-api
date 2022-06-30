import {MigrationInterface, QueryRunner} from "typeorm";

export class createOtps1656167330797 implements MigrationInterface {
    name = 'createOtps1656167330797'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."otps_status_enum" AS ENUM('send', 'verified')`);
        await queryRunner.query(`CREATE TABLE "otps" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "mobile" character varying(20) NOT NULL, "ref_code" character varying(4) NOT NULL, "otp_code" character varying(6) NOT NULL, "verify_count" integer NOT NULL DEFAULT '0', "detail" character varying, "status" "public"."otps_status_enum" NOT NULL DEFAULT 'send', "customerId" integer, CONSTRAINT "REL_9b6882a3c9ebf3671ecea90a66" UNIQUE ("customerId"), CONSTRAINT "PK_91fef5ed60605b854a2115d2410" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "otps" ADD CONSTRAINT "FK_9b6882a3c9ebf3671ecea90a666" FOREIGN KEY ("customerId") REFERENCES "members"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "otps" DROP CONSTRAINT "FK_9b6882a3c9ebf3671ecea90a666"`);
        await queryRunner.query(`DROP TABLE "otps"`);
        await queryRunner.query(`DROP TYPE "public"."otps_status_enum"`);
    }

}
