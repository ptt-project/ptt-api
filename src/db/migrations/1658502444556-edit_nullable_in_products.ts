import {MigrationInterface, QueryRunner} from "typeorm";

export class editNullableInProducts1658502444556 implements MigrationInterface {
    name = 'editNullableInProducts1658502444556'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "option1" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "option2" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "price" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "stock" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "stock" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "price" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "option2" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "option1" SET NOT NULL`);
    }

}
