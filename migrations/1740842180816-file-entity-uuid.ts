import { MigrationInterface, QueryRunner } from "typeorm";

export class FileEntityUUID1740842180816 implements MigrationInterface {
    name = 'FileEntityUUID1740842180816'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "project" DROP CONSTRAINT "FK_aa413f190a5c4c572b240448213"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_b990102e90c2aa81774f4393002"`);

        await queryRunner.query(`ALTER TABLE "file_entity" DROP CONSTRAINT "PK_d8375e0b2592310864d2b4974b2"`);
        await queryRunner.query(`ALTER TABLE "file_entity" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "file_entity" ADD CONSTRAINT "PK_728a42a0fbdf3fc5f5a42c85e12" PRIMARY KEY ("uuid")`);

        await queryRunner.query(`ALTER TABLE "project" DROP CONSTRAINT "REL_aa413f190a5c4c572b24044821"`);
        await queryRunner.query(`ALTER TABLE "project" DROP COLUMN "image"`);
        await queryRunner.query(`ALTER TABLE "project" ADD "image" uuid`);
        await queryRunner.query(`ALTER TABLE "project" ADD CONSTRAINT "UQ_aa413f190a5c4c572b240448213" UNIQUE ("image")`);

        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_b990102e90c2aa81774f4393002"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "avatar_file_id"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "avatar_file_id" uuid`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_b990102e90c2aa81774f4393002" UNIQUE ("avatar_file_id")`);

        await queryRunner.query(`ALTER TABLE "project" ADD CONSTRAINT "FK_aa413f190a5c4c572b240448213" FOREIGN KEY ("image") REFERENCES "file_entity"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_b990102e90c2aa81774f4393002" FOREIGN KEY ("avatar_file_id") REFERENCES "file_entity"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_b990102e90c2aa81774f4393002"`);
        await queryRunner.query(`ALTER TABLE "project" DROP CONSTRAINT "FK_aa413f190a5c4c572b240448213"`);

        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_b990102e90c2aa81774f4393002"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "avatar_file_id"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "avatar_file_id" integer`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_b990102e90c2aa81774f4393002" UNIQUE ("avatar_file_id")`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_b990102e90c2aa81774f4393002" FOREIGN KEY ("avatar_file_id") REFERENCES "file_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);

        await queryRunner.query(`ALTER TABLE "project" DROP CONSTRAINT "UQ_aa413f190a5c4c572b240448213"`);
        await queryRunner.query(`ALTER TABLE "project" DROP COLUMN "image"`);
        await queryRunner.query(`ALTER TABLE "project" ADD "image" integer`);
        await queryRunner.query(`ALTER TABLE "project" ADD CONSTRAINT "REL_aa413f190a5c4c572b24044821" UNIQUE ("image")`);
        await queryRunner.query(`ALTER TABLE "project" ADD CONSTRAINT "FK_aa413f190a5c4c572b240448213" FOREIGN KEY ("image") REFERENCES "file_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);

        await queryRunner.query(`ALTER TABLE "file_entity" DROP CONSTRAINT "PK_728a42a0fbdf3fc5f5a42c85e12"`);
        await queryRunner.query(`ALTER TABLE "file_entity" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "file_entity" ADD CONSTRAINT "PK_d8375e0b2592310864d2b4974b2" PRIMARY KEY ("id")`);
    }
}