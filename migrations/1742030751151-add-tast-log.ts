import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTaskLog1742030751151 implements MigrationInterface {
    name = 'AddTaskLog1742030751151';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create the task_log table
        await queryRunner.query(`
            CREATE TABLE "task_log" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "duration" integer NOT NULL,
                "loggedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "taskId" uuid,
                CONSTRAINT "PK_0f80f57bb78387f37ef146434b8" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            ALTER TABLE "task_log"
                ADD CONSTRAINT "FK_task_log_task" FOREIGN KEY ("taskId")
                    REFERENCES "task"("id")
                    ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "task" ADD COLUMN "timeLoggerId" uuid
        `);

        await queryRunner.query(`
            ALTER TABLE "task" 
            ADD CONSTRAINT "FK_task_timeLogger" FOREIGN KEY ("timeLoggerId") 
            REFERENCES "task_log"("id") 
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "FK_task_timeLogger"`);
        await queryRunner.query(`ALTER TABLE "task_log" DROP CONSTRAINT "FK_task_log_task"`);

        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "timeLoggerId"`);

        await queryRunner.query(`DROP TABLE "task_log"`);
    }
}
