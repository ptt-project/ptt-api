import {MigrationInterface, QueryRunner} from "typeorm";

export class updateBankNameWithLanguage1663435504487 implements MigrationInterface {
    name = 'updateBankNameWithLanguage1663435504487'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "banks" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "banks" ADD "name_th" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "banks" ADD "name_en" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "banks" DROP COLUMN "name_en"`);
        await queryRunner.query(`ALTER TABLE "banks" DROP COLUMN "name_th"`);
        await queryRunner.query(`ALTER TABLE "banks" ADD "name" character varying NOT NULL`);
    }

}
