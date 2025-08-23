import { MigrationInterface, QueryRunner } from "typeorm";

export class ThreadMessageRole1755945896932 implements MigrationInterface {
    name = 'ThreadMessageRole1755945896932'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."thread_messages_role_enum" AS ENUM('user', 'model', 'system')`);
        await queryRunner.query(`ALTER TABLE "thread_messages" ADD "role" "public"."thread_messages_role_enum" NOT NULL DEFAULT 'user'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "thread_messages" DROP COLUMN "role"`);
        await queryRunner.query(`DROP TYPE "public"."thread_messages_role_enum"`);
    }

}
