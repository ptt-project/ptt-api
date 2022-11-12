import {MigrationInterface, QueryRunner} from "typeorm";

export class updateMemberForRelation1667058318346 implements MigrationInterface {
    name = 'updateMemberForRelation1667058318346'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "members" ADD "member_code" character varying(7) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "members" ADD "relationIds" text NOT NULL DEFAULT '[]'`);
        await queryRunner.query(`ALTER TABLE "members" DROP CONSTRAINT "FK_77d6b768f58e0a56355b35027e6"`);
        await queryRunner.query(`ALTER TABLE "members" DROP CONSTRAINT "REL_77d6b768f58e0a56355b35027e"`);
        await queryRunner.query(`ALTER TABLE "members" ADD CONSTRAINT "FK_77d6b768f58e0a56355b35027e6" FOREIGN KEY ("sp_code_id") REFERENCES "members"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "members" DROP CONSTRAINT "FK_77d6b768f58e0a56355b35027e6"`);
        await queryRunner.query(`ALTER TABLE "members" ADD CONSTRAINT "REL_77d6b768f58e0a56355b35027e" UNIQUE ("sp_code_id")`);
        await queryRunner.query(`ALTER TABLE "members" ADD CONSTRAINT "FK_77d6b768f58e0a56355b35027e6" FOREIGN KEY ("sp_code_id") REFERENCES "members"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "members" DROP COLUMN "relationIds"`);
        await queryRunner.query(`ALTER TABLE "members" DROP COLUMN "member_code"`);
    }

}
