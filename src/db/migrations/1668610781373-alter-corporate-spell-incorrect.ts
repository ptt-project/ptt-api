import {MigrationInterface, QueryRunner} from "typeorm";

export class alterCorporateSpellIncorrect1668610781373 implements MigrationInterface {
    name = 'alterCorporateSpellIncorrect1668610781373'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shops" DROP COLUMN "corperate_id"`);
        await queryRunner.query(`ALTER TABLE "shops" DROP COLUMN "corperate_name"`);
        await queryRunner.query(`ALTER TABLE "shops" ADD "corporate_name" character varying(50)`);
        await queryRunner.query(`ALTER TABLE "shops" ADD "corporate_id" character varying(20)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shops" DROP COLUMN "corporate_id"`);
        await queryRunner.query(`ALTER TABLE "shops" DROP COLUMN "corporate_name"`);
        await queryRunner.query(`ALTER TABLE "shops" ADD "corperate_name" character varying(50)`);
        await queryRunner.query(`ALTER TABLE "shops" ADD "corperate_id" character varying(20)`);
    }

}
