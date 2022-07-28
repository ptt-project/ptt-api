import {MigrationInterface, QueryRunner} from "typeorm";

export class updateMemberRole1657558369931 implements MigrationInterface {
    name = 'updateMemberRole1657558369931'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."members_role_enum" AS ENUM('Buyer', 'Seller')`);
        await queryRunner.query(`ALTER TABLE "members" ADD "role" "public"."members_role_enum" NOT NULL DEFAULT 'Buyer'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "members" DROP COLUMN "role"`);
        await queryRunner.query(`DROP TYPE "public"."members_role_enum"`);
    }

}
