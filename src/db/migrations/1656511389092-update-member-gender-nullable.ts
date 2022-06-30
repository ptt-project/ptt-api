import {MigrationInterface, QueryRunner} from "typeorm";

export class updateMemberGenderNullable1656511389092 implements MigrationInterface {
    name = 'updateMemberGenderNullable1656511389092'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "members" ALTER COLUMN "gender" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "members" ALTER COLUMN "gender" SET NOT NULL`);
    }

}
