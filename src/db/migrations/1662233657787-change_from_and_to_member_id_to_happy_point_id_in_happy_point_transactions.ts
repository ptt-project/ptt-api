import {MigrationInterface, QueryRunner} from "typeorm";

export class changeFromAndToMemberIdToHappyPointIdInHappyPointTransactions1662233657787 implements MigrationInterface {
    name = 'changeFromAndToMemberIdToHappyPointIdInHappyPointTransactions1662233657787'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_abd32aad06e146289e45ff0f69"`);
        await queryRunner.query(`ALTER TABLE "happy_point_transactions" DROP COLUMN "from_wallet_id"`);
        await queryRunner.query(`ALTER TABLE "happy_point_transactions" DROP COLUMN "to_wallet_id"`);
        await queryRunner.query(`ALTER TABLE "happy_point_transactions" ADD "to_happy_point_id" integer`);
        await queryRunner.query(`ALTER TABLE "happy_point_transactions" DROP CONSTRAINT "FK_7386a64470b4c9f1fa8fb8b1eb7"`);
        await queryRunner.query(`ALTER TABLE "happy_point_transactions" ALTER COLUMN "from_happy_point_id" SET NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_dce6da2dbd3e9b8438274de4d7" ON "happy_point_transactions" ("from_happy_point_id", "ref_id") `);
        await queryRunner.query(`ALTER TABLE "happy_point_transactions" ADD CONSTRAINT "FK_7386a64470b4c9f1fa8fb8b1eb7" FOREIGN KEY ("from_happy_point_id") REFERENCES "happy_points"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "happy_point_transactions" DROP CONSTRAINT "FK_7386a64470b4c9f1fa8fb8b1eb7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_dce6da2dbd3e9b8438274de4d7"`);
        await queryRunner.query(`ALTER TABLE "happy_point_transactions" ALTER COLUMN "from_happy_point_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "happy_point_transactions" ADD CONSTRAINT "FK_7386a64470b4c9f1fa8fb8b1eb7" FOREIGN KEY ("from_happy_point_id") REFERENCES "happy_points"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "happy_point_transactions" DROP COLUMN "to_happy_point_id"`);
        await queryRunner.query(`ALTER TABLE "happy_point_transactions" ADD "to_wallet_id" integer`);
        await queryRunner.query(`ALTER TABLE "happy_point_transactions" ADD "from_wallet_id" integer NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_abd32aad06e146289e45ff0f69" ON "happy_point_transactions" ("ref_id", "from_wallet_id") `);
    }

}
