import {MigrationInterface, QueryRunner} from "typeorm";

export class createHappyPointTransactions1662049247965 implements MigrationInterface {
    name = 'createHappyPointTransactions1662049247965'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."happy_point_transactions_type_enum" AS ENUM('BUY', 'SELL', 'TRANSFER')`);
        await queryRunner.query(`CREATE TYPE "public"."happy_point_transactions_detail_enum" AS ENUM('CREDIT', 'DEBIT')`);
        await queryRunner.query(`CREATE TYPE "public"."happy_point_transactions_status_enum" AS ENUM('SUCCESS', 'CANCEL', 'FAIL')`);
        await queryRunner.query(`CREATE TABLE "happy_point_transactions" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "ref_id" character varying NOT NULL, "type" "public"."happy_point_transactions_type_enum" NOT NULL, "from_member_id" integer NOT NULL, "detail" "public"."happy_point_transactions_detail_enum" NOT NULL, "amount" numeric(12,4) NOT NULL DEFAULT '0', "to_member_id" integer NOT NULL, "status" "public"."happy_point_transactions_status_enum" NOT NULL, CONSTRAINT "PK_2feb193a7d09b82c99f12cb164d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "happy_point_transactions" ADD CONSTRAINT "FK_1a7bebd4986ce71c97e36b8bbd2" FOREIGN KEY ("from_member_id") REFERENCES "members"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "happy_point_transactions" ADD CONSTRAINT "FK_0787d0a1ee8e5c521e533365d84" FOREIGN KEY ("to_member_id") REFERENCES "members"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "happy_point_transactions" DROP CONSTRAINT "FK_0787d0a1ee8e5c521e533365d84"`);
        await queryRunner.query(`ALTER TABLE "happy_point_transactions" DROP CONSTRAINT "FK_1a7bebd4986ce71c97e36b8bbd2"`);
        await queryRunner.query(`DROP TABLE "happy_point_transactions"`);
        await queryRunner.query(`DROP TYPE "public"."happy_point_transactions_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."happy_point_transactions_detail_enum"`);
        await queryRunner.query(`DROP TYPE "public"."happy_point_transactions_type_enum"`);
    }

}
