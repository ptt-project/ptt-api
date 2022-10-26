import { MigrationInterface, QueryRunner } from 'typeorm'

export class addIsRecommendedInShops1666807259271
  implements MigrationInterface {
  name = 'addIsRecommendedInShops1666807259271'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "shops" ADD "is_recommended" boolean NOT NULL DEFAULT false`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "shops" DROP COLUMN "is_recommended"`)
  }
}
