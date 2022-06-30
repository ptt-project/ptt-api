import {MigrationInterface, QueryRunner} from "typeorm";

export class removeMemberInOtp1656345665364 implements MigrationInterface {
    name = 'removeMemberInOtp1656345665364'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "otps" DROP CONSTRAINT "FK_9b6882a3c9ebf3671ecea90a666"`);
        await queryRunner.query(`ALTER TABLE "otps" DROP CONSTRAINT "REL_9b6882a3c9ebf3671ecea90a66"`);
        await queryRunner.query(`ALTER TABLE "otps" DROP COLUMN "customerId"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "otps" ADD "customerId" integer`);
        await queryRunner.query(`ALTER TABLE "otps" ADD CONSTRAINT "REL_9b6882a3c9ebf3671ecea90a66" UNIQUE ("customerId")`);
        await queryRunner.query(`ALTER TABLE "otps" ADD CONSTRAINT "FK_9b6882a3c9ebf3671ecea90a666" FOREIGN KEY ("customerId") REFERENCES "members"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
