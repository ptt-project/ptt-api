import {MigrationInterface, QueryRunner} from "typeorm";

export class addColumnAmoutTotalToProduct1663863038128 implements MigrationInterface {
    name = 'addColumnAmoutTotalToProduct1663863038128'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ADD "amout_total" numeric(12,4) NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "amout_total"`);
    }

}
