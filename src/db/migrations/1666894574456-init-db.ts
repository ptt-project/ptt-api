import { MigrationInterface, QueryRunner } from 'typeorm'

export class initDb1666894574456 implements MigrationInterface {
  name = 'initDb1666894574456'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."happy_point_transactions_type_enum" AS ENUM('BUY', 'SELL', 'TRANSFER')`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."happy_point_transactions_note_enum" AS ENUM('CREDIT', 'DEBIT')`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."happy_point_transactions_status_enum" AS ENUM('SUCCESS', 'CANCEL', 'FAIL', 'PENDING')`,
    )
    await queryRunner.query(
      `CREATE TABLE "happy_point_transactions" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "ref_id" character varying NOT NULL, "type" "public"."happy_point_transactions_type_enum" NOT NULL, "from_happy_point_id" uuid NOT NULL, "note" "public"."happy_point_transactions_note_enum" NOT NULL, "point" numeric(12,4) NOT NULL, "to_happy_point_id" uuid, "status" "public"."happy_point_transactions_status_enum" NOT NULL, "total_amount" numeric(12,4), "exchange_rate" numeric(12,4) NOT NULL, "fee" numeric(12,4) DEFAULT '0', "amount" numeric(12,4) DEFAULT '0', "total_point" numeric(12,4), "fee_point" numeric(12,4) DEFAULT '0', CONSTRAINT "PK_2feb193a7d09b82c99f12cb164d" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_dce6da2dbd3e9b8438274de4d7" ON "happy_point_transactions" ("from_happy_point_id", "ref_id") `,
    )
    await queryRunner.query(
      `CREATE TABLE "happy_points" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "member_id" uuid NOT NULL, "balance" numeric(12,4) NOT NULL DEFAULT '0', "limtit_transfer" numeric(12,4) NOT NULL DEFAULT '0', CONSTRAINT "PK_27a0bab4989bbc6745b8855e201" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "wallets" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "member_id" uuid NOT NULL, "balance" numeric(12,2) NOT NULL DEFAULT '0', CONSTRAINT "PK_8402e5df5a30a229380e83e4f7e" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "wallet_transaction_references" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "transaction_id" uuid NOT NULL, "result_code" character varying, "reference_no" character varying NOT NULL, "third_pt_reference_no" character varying, "amount" numeric(12,2) NOT NULL DEFAULT '0', "detail" character varying, CONSTRAINT "REL_ea00ed490bc29165edad6c0e60" UNIQUE ("transaction_id"), CONSTRAINT "PK_f4147b4a01bf01f2233eec8b732" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."wallet_transactions_type_enum" AS ENUM('deposit', 'withdraw', 'buy', 'sell', 'buy_happy_point', 'sell_happy_point')`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."wallet_transactions_status_enum" AS ENUM('success', 'fail', 'cancel', 'pending')`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."wallet_transactions_note_enum" AS ENUM('credit', 'debit')`,
    )
    await queryRunner.query(
      `CREATE TABLE "wallet_transactions" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "wallet_id" uuid NOT NULL, "type" "public"."wallet_transactions_type_enum" NOT NULL, "amount" numeric(12,2) NOT NULL DEFAULT '0', "detail" character varying, "status" "public"."wallet_transactions_status_enum" NOT NULL, "note" "public"."wallet_transactions_note_enum" NOT NULL, "reference_id" uuid, "bank_account_id" uuid, CONSTRAINT "REL_fb28735205a7021d74c61d7bd2" UNIQUE ("reference_id"), CONSTRAINT "PK_5120f131bde2cda940ec1a621db" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "bank_accounts" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "member_id" uuid NOT NULL, "full_name" character varying NOT NULL, "thai_id" character varying NOT NULL, "bank_code" character varying NOT NULL, "account_number" character varying NOT NULL, "account_holder" character varying NOT NULL, "is_main" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_c872de764f2038224a013ff25ed" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "mobiles" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "member_id" uuid NOT NULL, "mobile" character varying(20) NOT NULL, "is_primary" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_59ee2365f347e4709b04279bfdb" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."categories_created_by_enum" AS ENUM('seller', 'admin')`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."categories_status_enum" AS ENUM('active', 'inactive')`,
    )
    await queryRunner.query(
      `CREATE TABLE "categories" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "shop_id" uuid NOT NULL, "name" character varying(40) NOT NULL, "created_by" "public"."categories_created_by_enum" NOT NULL, "status" "public"."categories_status_enum" NOT NULL DEFAULT 'inactive', "product_count" integer NOT NULL DEFAULT '0', "priority" integer NOT NULL, CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "category_product_profiles" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "category_id" uuid NOT NULL, "product_profile_id" character varying NOT NULL, CONSTRAINT "PK_1042feb9588550ab0beecc01ec5" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "product_options" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "product_profile_id" character varying NOT NULL, "options" text NOT NULL, CONSTRAINT "PK_3916b02fb43aa725f8167c718e4" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "product_profiles" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "name" character varying NOT NULL, "detail" text NOT NULL, "shop_id" uuid NOT NULL, "platform_category_id" uuid NOT NULL, "brand_id" uuid, "status" character varying NOT NULL, "approval" boolean NOT NULL DEFAULT false, "weight" numeric(5,2) NOT NULL, "width" integer NOT NULL, "length" integer NOT NULL, "height" integer NOT NULL, "exp" integer, "condition" character varying, "is_send_lated" boolean, "extra_day" integer, "video_link" character varying, "image_ids" text, "watched" integer DEFAULT '0', "like" integer DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP) PARTITION BY LIST(shop_id)`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."platform_categories_status_enum" AS ENUM('active', 'inactive')`,
    )
    await queryRunner.query(
      `CREATE TABLE "platform_categories" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying(40) NOT NULL, "status" "public"."platform_categories_status_enum" NOT NULL DEFAULT 'inactive', CONSTRAINT "PK_f6c5cd49610c2ce3e25bb6bea7b" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "sku" character varying NOT NULL, "product_profile_id" character varying NOT NULL, "option1" character varying, "option2" character varying, "price" numeric(12,2), "stock" integer, "sold" numeric(12,4) NOT NULL DEFAULT '0', "shop_id" uuid, "platform_category_id" uuid, CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."shops_type_enum" AS ENUM('Normal', 'Mall')`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."shops_approval_status_enum" AS ENUM('requested', 'rejected', 'approved')`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."shops_mall_applicant_role_enum" AS ENUM('Brand Owner', 'Exclusive Distributor', 'Non-Exclusive Distributor', 'Retailer', 'Other')`,
    )
    await queryRunner.query(
      `CREATE TABLE "shops" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "type" "public"."shops_type_enum" NOT NULL DEFAULT 'Normal', "full_name" character varying(50) NOT NULL, "mobile" character varying(10), "email" character varying(50) NOT NULL, "brand_name" character varying(50) NOT NULL, "category" character varying(50) NOT NULL, "website" character varying(50), "facebook_page" character varying(50), "instagram" character varying(50), "social_media" character varying(200), "note" character varying(1000), "corperate_name" character varying(50), "corperate_id" character varying(20), "approval_status" "public"."shops_approval_status_enum" NOT NULL DEFAULT 'requested', "shop_name" character varying(30), "shop_description" character varying(500), "product_count" integer NOT NULL DEFAULT '0', "reply_rate" numeric(5,2) NOT NULL DEFAULT '0', "shop_score" numeric(2,1) NOT NULL DEFAULT '0', "score_count" integer NOT NULL DEFAULT '0', "cancel_rate" numeric(5,2) NOT NULL DEFAULT '0', "mall_applicant_role" "public"."shops_mall_applicant_role_enum", "mall_offline_shop_detail" character varying, "mall_shop_description" character varying, "profile_image_path" character varying, "cover_image_path" character varying, "member_id" uuid, CONSTRAINT "REL_351c6aa0db45eab2b127b4dab1" UNIQUE ("member_id"), CONSTRAINT "PK_3c6aaa6607d287de99815e60b96" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."members_gender_enum" AS ENUM('F', 'M', 'O')`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."members_role_enum" AS ENUM('Buyer', 'Seller')`,
    )
    await queryRunner.query(
      `CREATE TABLE "members" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "username" character varying(50) NOT NULL, "first_name" character varying(50) NOT NULL, "last_name" character varying(50) NOT NULL, "password" character varying NOT NULL, "mobile" character varying(20), "pdpa_status" boolean, "birthday" date, "sp_code_id" uuid, "gender" "public"."members_gender_enum", "email" character varying(50) NOT NULL, "role" "public"."members_role_enum" NOT NULL DEFAULT 'Buyer', "image_id" character varying, CONSTRAINT "REL_77d6b768f58e0a56355b35027e" UNIQUE ("sp_code_id"), CONSTRAINT "PK_28b53062261b996d9c99fa12404" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "addresses" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "mobile" character varying(20) NOT NULL, "member_id" uuid NOT NULL, "province" character varying NOT NULL, "tambon" character varying, "district" character varying NOT NULL, "postcode" character varying(5) NOT NULL, "address" character varying, "geo_name" text DEFAULT '{}', "is_main" boolean DEFAULT false, "is_home" boolean DEFAULT false, "is_work" boolean DEFAULT false, "is_pickup" boolean DEFAULT false, "is_return_item" boolean DEFAULT false, CONSTRAINT "PK_745d8f43d3af10ab8247465e450" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "address_masters" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "data" text NOT NULL, CONSTRAINT "PK_357b75ea36d3463f578c58bd607" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "brands" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, CONSTRAINT "PK_b0c437120b624da1034a81fc561" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "exchange_rates" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "exchange_rate" numeric(12,4) NOT NULL DEFAULT '0', CONSTRAINT "PK_33a614bad9e61956079d817ebe2" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "exchange_rate_transactions" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "old_exchange_rate" numeric(12,4) NOT NULL DEFAULT '0', "new_exchange_rate" numeric(12,4) NOT NULL DEFAULT '0', CONSTRAINT "PK_bdd328c3c9426b8afd2022f19bd" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "master_config" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "config" text DEFAULT '{}', CONSTRAINT "PK_4bba6d1e292c7e4f6afd7fac5e2" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."otps_status_enum" AS ENUM('send', 'verified')`,
    )
    await queryRunner.query(
      `CREATE TABLE "otps" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "reference" character varying NOT NULL, "ref_code" character varying(4) NOT NULL, "otp_code" character varying(6) NOT NULL, "verify_count" integer NOT NULL DEFAULT '0', "type" character varying, "status" "public"."otps_status_enum" NOT NULL DEFAULT 'send', CONSTRAINT "PK_91fef5ed60605b854a2115d2410" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "images" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_1fe148074c6a1a91b63cb9ee3c9" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "reviews" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "seller_id" uuid NOT NULL, "comment" character varying, "reply" character varying, "star" integer, "is_reply" boolean NOT NULL DEFAULT false, "is_hide" boolean NOT NULL DEFAULT false, "reviewer_id" uuid NOT NULL, "created_date" TIMESTAMP NOT NULL, CONSTRAINT "PK_231ae565c273ee700b283f15c1d" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "banks" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "bank_code" character varying NOT NULL, "name_th" character varying NOT NULL, "name_en" character varying NOT NULL, CONSTRAINT "UQ_824dd9d33e9228917f28fc6e052" UNIQUE ("bank_code"), CONSTRAINT "PK_3975b5f684ec241e3901db62d77" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `ALTER TABLE "happy_point_transactions" ADD CONSTRAINT "FK_7386a64470b4c9f1fa8fb8b1eb7" FOREIGN KEY ("from_happy_point_id") REFERENCES "happy_points"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "happy_points" ADD CONSTRAINT "FK_b64b73695ff1690642811676a3c" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "wallets" ADD CONSTRAINT "FK_2ffeef1faa59259246b070f626a" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "wallet_transaction_references" ADD CONSTRAINT "FK_ea00ed490bc29165edad6c0e60b" FOREIGN KEY ("transaction_id") REFERENCES "wallet_transactions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" ADD CONSTRAINT "FK_c57d19129968160f4db28fc8b28" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" ADD CONSTRAINT "FK_fb28735205a7021d74c61d7bd2d" FOREIGN KEY ("reference_id") REFERENCES "wallet_transaction_references"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" ADD CONSTRAINT "FK_2aaa023ad7b82f9a14980b2cf57" FOREIGN KEY ("bank_account_id") REFERENCES "bank_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "bank_accounts" ADD CONSTRAINT "FK_e7a98880639f2a2a4ffd91e0e25" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "mobiles" ADD CONSTRAINT "FK_68edc6728faaa0b394710209f7e" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "categories" ADD CONSTRAINT "FK_b7782b67d6bffd48a980289eee1" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "category_product_profiles" ADD CONSTRAINT "FK_4ad19847db4ff39f54e429e8494" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "product_profiles" ADD CONSTRAINT "FK_566e19cb60106569b700174155a" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "product_profiles" ADD CONSTRAINT "FK_8732b4f5d6059c2f70c866dd8d7" FOREIGN KEY ("platform_category_id") REFERENCES "platform_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "FK_9e952e93f369f16e27dd786c33f" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "FK_1d1f56bfde0986bdcbdb5c25dad" FOREIGN KEY ("platform_category_id") REFERENCES "platform_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "shops" ADD CONSTRAINT "FK_351c6aa0db45eab2b127b4dab17" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "members" ADD CONSTRAINT "FK_77d6b768f58e0a56355b35027e6" FOREIGN KEY ("sp_code_id") REFERENCES "members"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "addresses" ADD CONSTRAINT "FK_72490966ef2345cee60e2031d8d" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD CONSTRAINT "FK_b138f300626648e9107e5521d0b" FOREIGN KEY ("seller_id") REFERENCES "members"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD CONSTRAINT "FK_92e950a2513a79bb3fab273c92e" FOREIGN KEY ("reviewer_id") REFERENCES "members"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP CONSTRAINT "FK_92e950a2513a79bb3fab273c92e"`,
    )
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP CONSTRAINT "FK_b138f300626648e9107e5521d0b"`,
    )
    await queryRunner.query(
      `ALTER TABLE "addresses" DROP CONSTRAINT "FK_72490966ef2345cee60e2031d8d"`,
    )
    await queryRunner.query(
      `ALTER TABLE "members" DROP CONSTRAINT "FK_77d6b768f58e0a56355b35027e6"`,
    )
    await queryRunner.query(
      `ALTER TABLE "shops" DROP CONSTRAINT "FK_351c6aa0db45eab2b127b4dab17"`,
    )
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "FK_1d1f56bfde0986bdcbdb5c25dad"`,
    )
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "FK_9e952e93f369f16e27dd786c33f"`,
    )
    await queryRunner.query(
      `ALTER TABLE "product_profiles" DROP CONSTRAINT "FK_8732b4f5d6059c2f70c866dd8d7"`,
    )
    await queryRunner.query(
      `ALTER TABLE "product_profiles" DROP CONSTRAINT "FK_566e19cb60106569b700174155a"`,
    )
    await queryRunner.query(
      `ALTER TABLE "category_product_profiles" DROP CONSTRAINT "FK_4ad19847db4ff39f54e429e8494"`,
    )
    await queryRunner.query(
      `ALTER TABLE "categories" DROP CONSTRAINT "FK_b7782b67d6bffd48a980289eee1"`,
    )
    await queryRunner.query(
      `ALTER TABLE "mobiles" DROP CONSTRAINT "FK_68edc6728faaa0b394710209f7e"`,
    )
    await queryRunner.query(
      `ALTER TABLE "bank_accounts" DROP CONSTRAINT "FK_e7a98880639f2a2a4ffd91e0e25"`,
    )
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" DROP CONSTRAINT "FK_2aaa023ad7b82f9a14980b2cf57"`,
    )
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" DROP CONSTRAINT "FK_fb28735205a7021d74c61d7bd2d"`,
    )
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" DROP CONSTRAINT "FK_c57d19129968160f4db28fc8b28"`,
    )
    await queryRunner.query(
      `ALTER TABLE "wallet_transaction_references" DROP CONSTRAINT "FK_ea00ed490bc29165edad6c0e60b"`,
    )
    await queryRunner.query(
      `ALTER TABLE "wallets" DROP CONSTRAINT "FK_2ffeef1faa59259246b070f626a"`,
    )
    await queryRunner.query(
      `ALTER TABLE "happy_points" DROP CONSTRAINT "FK_b64b73695ff1690642811676a3c"`,
    )
    await queryRunner.query(
      `ALTER TABLE "happy_point_transactions" DROP CONSTRAINT "FK_7386a64470b4c9f1fa8fb8b1eb7"`,
    )
    await queryRunner.query(`DROP TABLE "banks"`)
    await queryRunner.query(`DROP TABLE "reviews"`)
    await queryRunner.query(`DROP TABLE "images"`)
    await queryRunner.query(`DROP TABLE "otps"`)
    await queryRunner.query(`DROP TYPE "public"."otps_status_enum"`)
    await queryRunner.query(`DROP TABLE "master_config"`)
    await queryRunner.query(`DROP TABLE "exchange_rate_transactions"`)
    await queryRunner.query(`DROP TABLE "exchange_rates"`)
    await queryRunner.query(`DROP TABLE "brands"`)
    await queryRunner.query(`DROP TABLE "address_masters"`)
    await queryRunner.query(`DROP TABLE "addresses"`)
    await queryRunner.query(`DROP TABLE "members"`)
    await queryRunner.query(`DROP TYPE "public"."members_role_enum"`)
    await queryRunner.query(`DROP TYPE "public"."members_gender_enum"`)
    await queryRunner.query(`DROP TABLE "shops"`)
    await queryRunner.query(
      `DROP TYPE "public"."shops_mall_applicant_role_enum"`,
    )
    await queryRunner.query(`DROP TYPE "public"."shops_approval_status_enum"`)
    await queryRunner.query(`DROP TYPE "public"."shops_type_enum"`)
    await queryRunner.query(`DROP TABLE "products"`)
    await queryRunner.query(`DROP TABLE "platform_categories"`)
    await queryRunner.query(
      `DROP TYPE "public"."platform_categories_status_enum"`,
    )
    await queryRunner.query(`DROP TABLE "product_profiles"`)
    await queryRunner.query(`DROP TABLE "product_options"`)
    await queryRunner.query(`DROP TABLE "category_product_profiles"`)
    await queryRunner.query(`DROP TABLE "categories"`)
    await queryRunner.query(`DROP TYPE "public"."categories_status_enum"`)
    await queryRunner.query(`DROP TYPE "public"."categories_created_by_enum"`)
    await queryRunner.query(`DROP TABLE "mobiles"`)
    await queryRunner.query(`DROP TABLE "bank_accounts"`)
    await queryRunner.query(`DROP TABLE "wallet_transactions"`)
    await queryRunner.query(
      `DROP TYPE "public"."wallet_transactions_note_enum"`,
    )
    await queryRunner.query(
      `DROP TYPE "public"."wallet_transactions_status_enum"`,
    )
    await queryRunner.query(
      `DROP TYPE "public"."wallet_transactions_type_enum"`,
    )
    await queryRunner.query(`DROP TABLE "wallet_transaction_references"`)
    await queryRunner.query(`DROP TABLE "wallets"`)
    await queryRunner.query(`DROP TABLE "happy_points"`)
    await queryRunner.query(
      `DROP INDEX "public"."IDX_dce6da2dbd3e9b8438274de4d7"`,
    )
    await queryRunner.query(`DROP TABLE "happy_point_transactions"`)
    await queryRunner.query(
      `DROP TYPE "public"."happy_point_transactions_status_enum"`,
    )
    await queryRunner.query(
      `DROP TYPE "public"."happy_point_transactions_note_enum"`,
    )
    await queryRunner.query(
      `DROP TYPE "public"."happy_point_transactions_type_enum"`,
    )
  }
}
