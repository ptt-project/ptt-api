import {MigrationInterface, QueryRunner} from "typeorm";

export class createCategoryProducts1658427023103 implements MigrationInterface {
    name = 'createCategoryProducts1658427023103'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "category_products" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "category_id" integer NOT NULL, "product_id" integer NOT NULL, CONSTRAINT "PK_f0ced3e957f2edbbc572b171686" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "category_products" ADD CONSTRAINT "FK_d65b7eeaa7fd67a31cae4123251" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "category_products" ADD CONSTRAINT "FK_b8fe50cde2a330decd589403895" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "category_products" DROP CONSTRAINT "FK_b8fe50cde2a330decd589403895"`);
        await queryRunner.query(`ALTER TABLE "category_products" DROP CONSTRAINT "FK_d65b7eeaa7fd67a31cae4123251"`);
        await queryRunner.query(`DROP TABLE "category_products"`);
    }

}
