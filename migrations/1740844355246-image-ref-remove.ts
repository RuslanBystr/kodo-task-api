import { MigrationInterface, QueryRunner } from "typeorm";

export class ProjectImage1740844355246 implements MigrationInterface {
    name = 'ProjectImage1740844355246'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "project" DROP CONSTRAINT "FK_aa413f190a5c4c572b240448213"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_b990102e90c2aa81774f4393002"`);
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "avatar_file_id" TO "avatar"`);
        await queryRunner.query(`ALTER TABLE "user" RENAME CONSTRAINT "UQ_b990102e90c2aa81774f4393002" TO "UQ_b613f025993be2d1e51ba4c2b5f"`);
        await queryRunner.query(`ALTER TABLE "project" DROP CONSTRAINT "UQ_aa413f190a5c4c572b240448213"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_b613f025993be2d1e51ba4c2b5f"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_b613f025993be2d1e51ba4c2b5f" UNIQUE ("avatar")`);
        await queryRunner.query(`ALTER TABLE "project" ADD CONSTRAINT "UQ_aa413f190a5c4c572b240448213" UNIQUE ("image")`);
        await queryRunner.query(`ALTER TABLE "user" RENAME CONSTRAINT "UQ_b613f025993be2d1e51ba4c2b5f" TO "UQ_b990102e90c2aa81774f4393002"`);
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "avatar" TO "avatar_file_id"`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_b990102e90c2aa81774f4393002" FOREIGN KEY ("avatar_file_id") REFERENCES "file_entity"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "project" ADD CONSTRAINT "FK_aa413f190a5c4c572b240448213" FOREIGN KEY ("image") REFERENCES "file_entity"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
