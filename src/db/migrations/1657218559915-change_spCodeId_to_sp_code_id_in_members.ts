import {MigrationInterface, QueryRunner} from "typeorm";

export class changeSpCodeIdToSpCodeIdInMembers1657218559915 implements MigrationInterface {
    name = 'changeSpCodeIdToSpCodeIdInMembers1657218559915'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "members" DROP CONSTRAINT "FK_451ec90fdd6b43f529e1dd0c085"`);
        await queryRunner.query(`ALTER TABLE "members" DROP CONSTRAINT "REL_451ec90fdd6b43f529e1dd0c08"`);
        await queryRunner.query(`ALTER TABLE "members" DROP COLUMN "spCodeId"`);
        await queryRunner.query(`ALTER TABLE "members" ADD "sp_code_id" integer`);
        await queryRunner.query(`ALTER TABLE "members" ADD CONSTRAINT "UQ_77d6b768f58e0a56355b35027e6" UNIQUE ("sp_code_id")`);
        await queryRunner.query(`ALTER TABLE "members" ADD "email" character varying(50) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "members" ADD CONSTRAINT "FK_77d6b768f58e0a56355b35027e6" FOREIGN KEY ("sp_code_id") REFERENCES "members"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "members" DROP CONSTRAINT "FK_77d6b768f58e0a56355b35027e6"`);
        await queryRunner.query(`ALTER TABLE "members" DROP COLUMN "email"`);
        await queryRunner.query(`ALTER TABLE "members" DROP CONSTRAINT "UQ_77d6b768f58e0a56355b35027e6"`);
        await queryRunner.query(`ALTER TABLE "members" DROP COLUMN "sp_code_id"`);
        await queryRunner.query(`ALTER TABLE "members" ADD "spCodeId" integer`);
        await queryRunner.query(`ALTER TABLE "members" ADD CONSTRAINT "REL_451ec90fdd6b43f529e1dd0c08" UNIQUE ("spCodeId")`);
        await queryRunner.query(`ALTER TABLE "members" ADD CONSTRAINT "FK_451ec90fdd6b43f529e1dd0c085" FOREIGN KEY ("spCodeId") REFERENCES "members"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
