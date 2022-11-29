import {MigrationInterface, QueryRunner} from "typeorm";

export class alterOrderShopAddOrderNumber1668318453857 implements MigrationInterface {
    name = 'alterOrderShopAddOrderNumber1668318453857'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_shops" ADD "order_number" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_shops" DROP COLUMN "order_number"`);
    }

}
