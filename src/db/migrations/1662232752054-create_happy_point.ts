import {MigrationInterface, QueryRunner} from "typeorm";

export class createHappyPoint1662232752054 implements MigrationInterface {
    name = 'createHappyPoint1662232752054'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "happy_point_transactions" DROP CONSTRAINT "FK_1a7bebd4986ce71c97e36b8bbd2"`);
        await queryRunner.query(`ALTER TABLE "happy_point_transactions" DROP CONSTRAINT "FK_0787d0a1ee8e5c521e533365d84"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_77d33cea20231d74ef8c6be471"`);
        await queryRunner.query(`CREATE TABLE "happy_points" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "member_id" integer NOT NULL, "balance" numeric(12,2) NOT NULL DEFAULT '0', CONSTRAINT "PK_27a0bab4989bbc6745b8855e201" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "happy_point_transactions" DROP COLUMN "from_member_id"`);
        await queryRunner.query(`ALTER TABLE "happy_point_transactions" DROP COLUMN "to_member_id"`);
        await queryRunner.query(`ALTER TABLE "happy_point_transactions" ADD "from_wallet_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "happy_point_transactions" ADD "to_wallet_id" integer`);
        await queryRunner.query(`ALTER TABLE "happy_point_transactions" ADD "from_happy_point_id" integer`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_abd32aad06e146289e45ff0f69" ON "happy_point_transactions" ("from_wallet_id", "ref_id") `);
        await queryRunner.query(`ALTER TABLE "happy_point_transactions" ADD CONSTRAINT "FK_7386a64470b4c9f1fa8fb8b1eb7" FOREIGN KEY ("from_happy_point_id") REFERENCES "happy_points"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "happy_points" ADD CONSTRAINT "FK_b64b73695ff1690642811676a3c" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "happy_points" DROP CONSTRAINT "FK_b64b73695ff1690642811676a3c"`);
        await queryRunner.query(`ALTER TABLE "happy_point_transactions" DROP CONSTRAINT "FK_7386a64470b4c9f1fa8fb8b1eb7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_abd32aad06e146289e45ff0f69"`);
        await queryRunner.query(`ALTER TABLE "happy_point_transactions" DROP COLUMN "from_happy_point_id"`);
        await queryRunner.query(`ALTER TABLE "happy_point_transactions" DROP COLUMN "to_wallet_id"`);
        await queryRunner.query(`ALTER TABLE "happy_point_transactions" DROP COLUMN "from_wallet_id"`);
        await queryRunner.query(`ALTER TABLE "happy_point_transactions" ADD "to_member_id" integer`);
        await queryRunner.query(`ALTER TABLE "happy_point_transactions" ADD "from_member_id" integer NOT NULL`);
        await queryRunner.query(`DROP TABLE "happy_points"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_77d33cea20231d74ef8c6be471" ON "happy_point_transactions" ("ref_id", "from_member_id") `);
        await queryRunner.query(`ALTER TABLE "happy_point_transactions" ADD CONSTRAINT "FK_0787d0a1ee8e5c521e533365d84" FOREIGN KEY ("to_member_id") REFERENCES "members"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "happy_point_transactions" ADD CONSTRAINT "FK_1a7bebd4986ce71c97e36b8bbd2" FOREIGN KEY ("from_member_id") REFERENCES "members"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
