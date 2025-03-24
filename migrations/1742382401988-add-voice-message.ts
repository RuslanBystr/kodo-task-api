import { MigrationInterface, QueryRunner } from "typeorm";

export class AddVoiceMessage1742382401988 implements MigrationInterface {
    name = 'AddVoiceMessage1742382401988'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task_log" DROP CONSTRAINT "FK_task_log_task"`);
        await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "FK_task_timeLogger"`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "timeLoggerId"`);
        await queryRunner.query(`ALTER TABLE "message" ADD "voice_message_file_id" uuid`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "UQ_46de27b7d9e1abb5247c5a60ec9" UNIQUE ("voice_message_file_id")`);
        await queryRunner.query(`ALTER TABLE "task_log" ALTER COLUMN "loggedAt" SET DEFAULT ('now'::text)::timestamp(6) with time zone`);
        await queryRunner.query(`ALTER TABLE "message" ALTER COLUMN "content" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "task_log" ADD CONSTRAINT "FK_1142dfec452e924b346f060fdaa" FOREIGN KEY ("taskId") REFERENCES "task"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_46de27b7d9e1abb5247c5a60ec9" FOREIGN KEY ("voice_message_file_id") REFERENCES "file_entity"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_46de27b7d9e1abb5247c5a60ec9"`);
        await queryRunner.query(`ALTER TABLE "task_log" DROP CONSTRAINT "FK_1142dfec452e924b346f060fdaa"`);
        await queryRunner.query(`ALTER TABLE "message" ALTER COLUMN "content" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "task_log" ALTER COLUMN "loggedAt" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "UQ_46de27b7d9e1abb5247c5a60ec9"`);
        await queryRunner.query(`ALTER TABLE "message" DROP COLUMN "voice_message_file_id"`);
        await queryRunner.query(`ALTER TABLE "task" ADD "timeLoggerId" uuid`);
        await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "FK_task_timeLogger" FOREIGN KEY ("timeLoggerId") REFERENCES "task_log"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task_log" ADD CONSTRAINT "FK_task_log_task" FOREIGN KEY ("taskId") REFERENCES "task"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
