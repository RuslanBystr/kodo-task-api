import { MigrationInterface, QueryRunner } from "typeorm";

export class TaskDetails1741097658314 implements MigrationInterface {
    name = 'TaskDetails1741097658314'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."task_priority_enum" AS ENUM('Low', 'Medium', 'High')`);
        await queryRunner.query(`ALTER TABLE "task" ADD "priority" "public"."task_priority_enum" NOT NULL DEFAULT 'Low'`);
        await queryRunner.query(`ALTER TABLE "task" ADD "started" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "task" ADD "deadline" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "task" ADD "estimate" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "task" ADD "spentTime" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "task" ADD "remaining" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "remaining"`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "spentTime"`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "estimate"`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "deadline"`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "started"`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "priority"`);
        await queryRunner.query(`DROP TYPE "public"."task_priority_enum"`);
    }

}
