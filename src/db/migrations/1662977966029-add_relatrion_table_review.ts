import {MigrationInterface, QueryRunner} from "typeorm";

export class addRelatrionTableReview1662977966029 implements MigrationInterface {
    name = 'addRelatrionTableReview1662977966029'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reviews" DROP COLUMN "created_date"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reviews" ADD "created_date" TIMESTAMP NOT NULL`);
    }

}
