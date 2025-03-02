import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserChatAndEnum1740827362244 implements MigrationInterface {
    name = 'AddUserChatAndEnum1740827362244'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chat" RENAME COLUMN "name" TO "groupName"`);
        await queryRunner.query(`CREATE TABLE "user_chat" ("id" SERIAL NOT NULL, "name" character varying, "userId" integer, "chatId" integer, CONSTRAINT "PK_c43d9c7669f5c12f23686e1b891" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."task_status_enum" AS ENUM('TODO', 'IN_PROGRESS', 'DONE')`);
        await queryRunner.query(`ALTER TABLE "task" ADD "status" "public"."task_status_enum" NOT NULL DEFAULT 'TODO'`);
        await queryRunner.query(`ALTER TABLE "user_chat" ADD CONSTRAINT "FK_63f6e1b207375c35588c673843e" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_chat" ADD CONSTRAINT "FK_e2f3a6eefb26aa957feee2c9dc3" FOREIGN KEY ("chatId") REFERENCES "chat"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_chat" DROP CONSTRAINT "FK_e2f3a6eefb26aa957feee2c9dc3"`);
        await queryRunner.query(`ALTER TABLE "user_chat" DROP CONSTRAINT "FK_63f6e1b207375c35588c673843e"`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."task_status_enum"`);
        await queryRunner.query(`DROP TABLE "user_chat"`);
        await queryRunner.query(`ALTER TABLE "chat" RENAME COLUMN "groupName" TO "name"`);
    }

}
