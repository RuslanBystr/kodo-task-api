import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLastMessage1742228911850 implements MigrationInterface {
    name = 'AddLastMessage1742228911850'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chat" ADD "lastMessageId" integer`);
        await queryRunner.query(`ALTER TABLE "chat" ADD CONSTRAINT "UQ_d96167b8ced25dc5253247fd348" UNIQUE ("lastMessageId")`);
        await queryRunner.query(`ALTER TABLE "chat" ADD CONSTRAINT "FK_d96167b8ced25dc5253247fd348" FOREIGN KEY ("lastMessageId") REFERENCES "message"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chat" DROP CONSTRAINT "FK_d96167b8ced25dc5253247fd348"`);
        await queryRunner.query(`ALTER TABLE "chat" DROP CONSTRAINT "UQ_d96167b8ced25dc5253247fd348"`);
        await queryRunner.query(`ALTER TABLE "chat" DROP COLUMN "lastMessageId"`);
    }
}
