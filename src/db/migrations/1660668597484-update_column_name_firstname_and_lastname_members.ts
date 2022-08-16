import {MigrationInterface, QueryRunner} from "typeorm";

export class updateColumnNameFirstnameAndLastnameMembers1660668597484 implements MigrationInterface {
    name = 'updateColumnNameFirstnameAndLastnameMembers1660668597484'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "members" DROP COLUMN "firstname"`);
        await queryRunner.query(`ALTER TABLE "members" DROP COLUMN "lastname"`);
        await queryRunner.query(`ALTER TABLE "members" ADD "first_name" character varying(50) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "members" ADD "last_name" character varying(50) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "members" DROP COLUMN "last_name"`);
        await queryRunner.query(`ALTER TABLE "members" DROP COLUMN "first_name"`);
        await queryRunner.query(`ALTER TABLE "members" ADD "lastname" character varying(50) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "members" ADD "firstname" character varying(50) NOT NULL`);
    }

}
