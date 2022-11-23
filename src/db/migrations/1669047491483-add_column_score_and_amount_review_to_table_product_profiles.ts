import { MigrationInterface, QueryRunner } from 'typeorm'

export class addColumnScoreAndAmountReviewToTableProductProfiles1669047491483
  implements MigrationInterface {
  name = 'addColumnScoreAndAmountReviewToTableProductProfiles1669047491483'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_profiles" ADD "score" integer DEFAULT '0'`,
    )
    await queryRunner.query(
      `ALTER TABLE "product_profiles" ADD "amount_review" integer DEFAULT '0'`,
    )
    await queryRunner.query(
      `ALTER TABLE "reviews" ALTER COLUMN "reply" DROP NOT NULL`,
    )
    await queryRunner.query(
      `ALTER TABLE "reviews" ALTER COLUMN "reply" DROP DEFAULT`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reviews" ALTER COLUMN "reply" SET DEFAULT ''`,
    )
    await queryRunner.query(
      `ALTER TABLE "reviews" ALTER COLUMN "reply" SET NOT NULL`,
    )
    await queryRunner.query(
      `ALTER TABLE "product_profiles" DROP COLUMN "amount_review"`,
    )
    await queryRunner.query(
      `ALTER TABLE "product_profiles" DROP COLUMN "score"`,
    )
  }
}
