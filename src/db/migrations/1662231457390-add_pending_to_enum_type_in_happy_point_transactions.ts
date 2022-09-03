import {MigrationInterface, QueryRunner} from "typeorm";

export class addPendingToEnumTypeInHappyPointTransactions1662231457390 implements MigrationInterface {
    name = 'addPendingToEnumTypeInHappyPointTransactions1662231457390'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."happy_point_transactions_status_enum" RENAME TO "happy_point_transactions_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."happy_point_transactions_status_enum" AS ENUM('SUCCESS', 'CANCEL', 'FAIL', 'PENDING')`);
        await queryRunner.query(`ALTER TABLE "happy_point_transactions" ALTER COLUMN "status" TYPE "public"."happy_point_transactions_status_enum" USING "status"::"text"::"public"."happy_point_transactions_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."happy_point_transactions_status_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."happy_point_transactions_status_enum_old" AS ENUM('SUCCESS', 'CANCEL', 'FAIL')`);
        await queryRunner.query(`ALTER TABLE "happy_point_transactions" ALTER COLUMN "status" TYPE "public"."happy_point_transactions_status_enum_old" USING "status"::"text"::"public"."happy_point_transactions_status_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."happy_point_transactions_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."happy_point_transactions_status_enum_old" RENAME TO "happy_point_transactions_status_enum"`);
    }

}
