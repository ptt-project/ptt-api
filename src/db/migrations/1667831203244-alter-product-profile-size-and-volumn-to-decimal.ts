import {MigrationInterface, QueryRunner} from "typeorm";

export class alterProductProfileSizeAndVolumnToDecimal1667831203244 implements MigrationInterface {
    name = 'alterProductProfileSizeAndVolumnToDecimal1667831203244'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_profiles" DROP COLUMN "width"`);
        await queryRunner.query(`ALTER TABLE "product_profiles" ADD "width" numeric(5,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_profiles" DROP COLUMN "length"`);
        await queryRunner.query(`ALTER TABLE "product_profiles" ADD "length" numeric(5,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_profiles" DROP COLUMN "height"`);
        await queryRunner.query(`ALTER TABLE "product_profiles" ADD "height" numeric(5,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "price" TYPE numeric(12,4)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "price" TYPE numeric(12,2)`);
        await queryRunner.query(`ALTER TABLE "product_profiles" DROP COLUMN "height"`);
        await queryRunner.query(`ALTER TABLE "product_profiles" ADD "height" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_profiles" DROP COLUMN "length"`);
        await queryRunner.query(`ALTER TABLE "product_profiles" ADD "length" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_profiles" DROP COLUMN "width"`);
        await queryRunner.query(`ALTER TABLE "product_profiles" ADD "width" integer NOT NULL`);
    }

}
