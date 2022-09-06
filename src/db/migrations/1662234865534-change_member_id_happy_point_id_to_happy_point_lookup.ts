import {MigrationInterface, QueryRunner} from "typeorm";

export class changeMemberIdHappyPointIdToHappyPointLookup1662234865534 implements MigrationInterface {
    name = 'changeMemberIdHappyPointIdToHappyPointLookup1662234865534'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "happy_point_look_up" RENAME COLUMN "member_id" TO "happy_point_id"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "happy_point_look_up" RENAME COLUMN "happy_point_id" TO "member_id"`);
    }

}
