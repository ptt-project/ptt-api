import { MigrationInterface, QueryRunner } from 'typeorm'

export class addRelationInReviews1668703081355 implements MigrationInterface {
  name = 'addRelationInReviews1668703081355'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP CONSTRAINT "FK_b138f300626648e9107e5521d0b"`,
    )
    await queryRunner.query(`ALTER TABLE "reviews" DROP COLUMN "seller_id"`)
    await queryRunner.query(`ALTER TABLE "reviews" DROP COLUMN "created_date"`)
    await queryRunner.query(`ALTER TABLE "reviews" ADD "shop_id" uuid NOT NULL`)
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD "product_profile_id" uuid NOT NULL`,
    )
    await queryRunner.query(
      `ALTER TABLE "reviews" ALTER COLUMN "star" SET NOT NULL`,
    )
    await queryRunner.query(
      `ALTER TABLE "reviews" ALTER COLUMN "star" SET DEFAULT '0'`,
    )
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD CONSTRAINT "FK_b8002ad83c018f58beac46dee3f" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP CONSTRAINT "FK_b8002ad83c018f58beac46dee3f"`,
    )
    await queryRunner.query(
      `ALTER TABLE "reviews" ALTER COLUMN "star" DROP DEFAULT`,
    )
    await queryRunner.query(
      `ALTER TABLE "reviews" ALTER COLUMN "star" DROP NOT NULL`,
    )
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP COLUMN "product_profile_id"`,
    )
    await queryRunner.query(`ALTER TABLE "reviews" DROP COLUMN "shop_id"`)
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD "created_date" TIMESTAMP NOT NULL`,
    )
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD "seller_id" uuid NOT NULL`,
    )
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD CONSTRAINT "FK_b138f300626648e9107e5521d0b" FOREIGN KEY ("seller_id") REFERENCES "members"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
  }
}
