import { MigrationInterface, QueryRunner } from "typeorm";

export class Threads1755943711841 implements MigrationInterface {
    name = 'Threads1755943711841'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "thread_messages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "thread_id" bigint NOT NULL, "content" text NOT NULL, "parts" jsonb, "token_count" integer, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_362f852009f5fceefddab0fbe81" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ea5bbe4f7f3931558dadf19cf8" ON "thread_messages" ("thread_id", "created_at") `);
        await queryRunner.query(`CREATE TABLE "threads" ("id" BIGSERIAL NOT NULL, "user_id" bigint NOT NULL, "title" character varying(255), "system_prompt" text, "summary" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_d8a74804c34fc3900502cd27275" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "thread_messages" ADD CONSTRAINT "FK_c6bc073e77f201aa2fdbaa1688e" FOREIGN KEY ("thread_id") REFERENCES "threads"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "thread_messages" DROP CONSTRAINT "FK_c6bc073e77f201aa2fdbaa1688e"`);
        await queryRunner.query(`DROP TABLE "threads"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ea5bbe4f7f3931558dadf19cf8"`);
        await queryRunner.query(`DROP TABLE "thread_messages"`);
    }

}
