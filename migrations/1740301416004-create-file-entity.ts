import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateFileEntity1740301416004 implements MigrationInterface {
    name = 'CreateFileEntity1740301416004'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "file_entity" ("id" SERIAL NOT NULL, "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "file_name" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, CONSTRAINT "UQ_f302883d0296e199aa1fa06785f" UNIQUE ("file_name"), CONSTRAINT "PK_d8375e0b2592310864d2b4974b2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user" ADD "avatar_file_id" integer`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_b990102e90c2aa81774f4393002" UNIQUE ("avatar_file_id")`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_b990102e90c2aa81774f4393002" FOREIGN KEY ("avatar_file_id") REFERENCES "file_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_b990102e90c2aa81774f4393002"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_b990102e90c2aa81774f4393002"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "avatar_file_id"`);
        await queryRunner.query(`DROP TABLE "file_entity"`);
    }

}
