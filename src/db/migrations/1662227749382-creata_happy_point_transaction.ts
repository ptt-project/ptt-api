import {MigrationInterface, QueryRunner} from "typeorm";

export class creataHappyPointTransaction1662227749382 implements MigrationInterface {
    name = 'creataHappyPointTransaction1662227749382'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."happy_point_transactions_type_enum" AS ENUM('BUY', 'SELL', 'TRANSFER')`);
        await queryRunner.query(`CREATE TYPE "public"."happy_point_transactions_note_enum" AS ENUM('CREDIT', 'DEBIT')`);
        await queryRunner.query(`CREATE TYPE "public"."happy_point_transactions_status_enum" AS ENUM('SUCCESS', 'CANCEL', 'FAIL')`);
        await queryRunner.query(`CREATE TABLE "happy_point_transactions" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "ref_id" character varying NOT NULL, "type" "public"."happy_point_transactions_type_enum" NOT NULL, "from_member_id" integer NOT NULL, "note" "public"."happy_point_transactions_note_enum" NOT NULL, "point" numeric(12,4) NOT NULL, "to_member_id" integer, "status" "public"."happy_point_transactions_status_enum" NOT NULL, "total_amount" numeric(12,4), "fee" numeric(12,4), "amount" numeric(12,4) DEFAULT '0', CONSTRAINT "PK_2feb193a7d09b82c99f12cb164d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_77d33cea20231d74ef8c6be471" ON "happy_point_transactions" ("from_member_id", "ref_id") `);
        await queryRunner.query(`ALTER TABLE "happy_point_transactions" ADD CONSTRAINT "FK_1a7bebd4986ce71c97e36b8bbd2" FOREIGN KEY ("from_member_id") REFERENCES "members"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "happy_point_transactions" ADD CONSTRAINT "FK_0787d0a1ee8e5c521e533365d84" FOREIGN KEY ("to_member_id") REFERENCES "members"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "happy_point_transactions" DROP CONSTRAINT "FK_0787d0a1ee8e5c521e533365d84"`);
        await queryRunner.query(`ALTER TABLE "happy_point_transactions" DROP CONSTRAINT "FK_1a7bebd4986ce71c97e36b8bbd2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_77d33cea20231d74ef8c6be471"`);
        await queryRunner.query(`DROP TABLE "happy_point_transactions"`);
        await queryRunner.query(`DROP TYPE "public"."happy_point_transactions_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."happy_point_transactions_note_enum"`);
        await queryRunner.query(`DROP TYPE "public"."happy_point_transactions_type_enum"`);
    }

}
