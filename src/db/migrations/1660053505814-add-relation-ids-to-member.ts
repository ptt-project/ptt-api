import {MigrationInterface, QueryRunner} from "typeorm";

export class addRelationIdsToMember1660053505814 implements MigrationInterface {
    name = 'addRelationIdsToMember1660053505814'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "members" ADD "relationIds" text NOT NULL DEFAULT '[]'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "members" DROP COLUMN "relationIds"`);
    }

}
