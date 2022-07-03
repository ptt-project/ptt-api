import {MigrationInterface, QueryRunner} from "typeorm";

export class changeAmphurToTambonInAddresses1656821009313 implements MigrationInterface {
    name = 'changeAmphurToTambonInAddresses1656821009313'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "addresses" RENAME COLUMN "amphur" TO "tambon"`);
        await queryRunner.query(`ALTER TABLE "addresses" ALTER COLUMN "tambon" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "addresses" ALTER COLUMN "tambon" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "addresses" RENAME COLUMN "tambon" TO "amphur"`);
    }

}
