import {MigrationInterface, QueryRunner} from "typeorm";

export class updateMemberSpCode1661575163284 implements MigrationInterface {
    name = 'updateMemberSpCode1661575163284'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "members" DROP CONSTRAINT "FK_77d6b768f58e0a56355b35027e6"`);
        await queryRunner.query(`ALTER TABLE "members" DROP CONSTRAINT "UQ_77d6b768f58e0a56355b35027e6"`);
        await queryRunner.query(`ALTER TABLE "members" ADD CONSTRAINT "FK_77d6b768f58e0a56355b35027e6" FOREIGN KEY ("sp_code_id") REFERENCES "members"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "members" DROP CONSTRAINT "FK_77d6b768f58e0a56355b35027e6"`);
        await queryRunner.query(`ALTER TABLE "members" ADD CONSTRAINT "UQ_77d6b768f58e0a56355b35027e6" UNIQUE ("sp_code_id")`);
        await queryRunner.query(`ALTER TABLE "members" ADD CONSTRAINT "FK_77d6b768f58e0a56355b35027e6" FOREIGN KEY ("sp_code_id") REFERENCES "members"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
