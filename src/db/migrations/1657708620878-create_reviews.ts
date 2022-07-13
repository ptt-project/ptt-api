import {MigrationInterface, QueryRunner} from "typeorm";

export class createReviews1657708620878 implements MigrationInterface {
    name = 'createReviews1657708620878'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "reviews" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "seller_id" integer NOT NULL, "comment" character varying, "reply" character varying, "star" integer, "is_reply" boolean NOT NULL DEFAULT false, "is_hide" boolean NOT NULL DEFAULT false, "reviewer_id" integer NOT NULL, "created_date" TIMESTAMP NOT NULL, CONSTRAINT "PK_231ae565c273ee700b283f15c1d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "reviews" ADD CONSTRAINT "FK_b138f300626648e9107e5521d0b" FOREIGN KEY ("seller_id") REFERENCES "members"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reviews" ADD CONSTRAINT "FK_92e950a2513a79bb3fab273c92e" FOREIGN KEY ("reviewer_id") REFERENCES "members"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reviews" DROP CONSTRAINT "FK_92e950a2513a79bb3fab273c92e"`);
        await queryRunner.query(`ALTER TABLE "reviews" DROP CONSTRAINT "FK_b138f300626648e9107e5521d0b"`);
        await queryRunner.query(`DROP TABLE "reviews"`);
    }

}
