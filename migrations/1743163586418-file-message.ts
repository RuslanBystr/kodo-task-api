import { MigrationInterface, QueryRunner } from "typeorm";

export class FileMessage1743163586418 implements MigrationInterface {
    name = 'FileMessage1743163586418'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "message" ADD "file_id" uuid`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "UQ_7d21074cf540154ab81a1159372" UNIQUE ("file_id")`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_7d21074cf540154ab81a1159372" FOREIGN KEY ("file_id") REFERENCES "file_entity"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_7d21074cf540154ab81a1159372"`);
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "UQ_7d21074cf540154ab81a1159372"`);
        await queryRunner.query(`ALTER TABLE "message" DROP COLUMN "file_id"`);
    }

}
