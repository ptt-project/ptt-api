import {MigrationInterface, QueryRunner} from "typeorm";

export class updateTableOrder1667037441297 implements MigrationInterface {
    name = 'updateTableOrder1667037441297'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "payment_id"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "payment_id" uuid`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "UQ_5b3e94bd2aedc184f9ad8c10439" UNIQUE ("payment_id")`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "order_id"`);
        await queryRunner.query(`ALTER TABLE "payments" ADD "order_id" uuid`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "UQ_b2f7b823a21562eeca20e72b006" UNIQUE ("order_id")`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_5b3e94bd2aedc184f9ad8c10439" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "FK_b2f7b823a21562eeca20e72b006" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_b2f7b823a21562eeca20e72b006"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_5b3e94bd2aedc184f9ad8c10439"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "UQ_b2f7b823a21562eeca20e72b006"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "order_id"`);
        await queryRunner.query(`ALTER TABLE "payments" ADD "order_id" character varying`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "UQ_5b3e94bd2aedc184f9ad8c10439"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "payment_id"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "payment_id" character varying`);
    }

}
