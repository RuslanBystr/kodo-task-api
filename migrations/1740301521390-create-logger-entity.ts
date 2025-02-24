import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateLoggerEntity1740301521390 implements MigrationInterface {
    name = 'CreateLoggerEntity1740301521390'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."log_type_enum" AS ENUM('debug', 'exception')`);
        await queryRunner.query(`CREATE TABLE "log" ("id" SERIAL NOT NULL, "message" character varying NOT NULL, "stack_trace" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "type" "public"."log_type_enum", CONSTRAINT "PK_350604cbdf991d5930d9e618fbd" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "log"`);
        await queryRunner.query(`DROP TYPE "public"."log_type_enum"`);
    }

}
