import { MigrationInterface, QueryRunner } from "typeorm";

export class Workspaces1776675543533 implements MigrationInterface {
    name = 'Workspaces1776675543533'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "workspaces" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_de659ece27e93d8fe29339d0a42" UNIQUE ("name"), CONSTRAINT "PK_098656ae401f3e1a4586f47fd8e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."workspace_members_role_enum" AS ENUM('owner', 'admin', 'member', 'viewer')`);
        await queryRunner.query(`CREATE TABLE "workspace_members" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "role" "public"."workspace_members_role_enum" NOT NULL DEFAULT 'member', "joined_at" TIMESTAMP NOT NULL DEFAULT now(), "workspace_id" uuid NOT NULL, "user_id" integer NOT NULL, CONSTRAINT "UQ_4896b609c71ca5ad20ad662077b" UNIQUE ("workspace_id", "user_id"), CONSTRAINT "PK_22ab43ac5865cd62769121d2bc4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_4896b609c71ca5ad20ad662077" ON "workspace_members" ("workspace_id", "user_id") `);
        await queryRunner.query(`ALTER TABLE "project" ADD "workspace_id" uuid`);
        await queryRunner.query(`ALTER TABLE "project" ADD CONSTRAINT "FK_5cb157e3d3ab8abd16251129dba" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "workspace_members" ADD CONSTRAINT "FK_4a7c584ddfe855379598b5e20fd" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "workspace_members" ADD CONSTRAINT "FK_4e83431119fa585fc7aa8b817db" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "workspace_members" DROP CONSTRAINT "FK_4e83431119fa585fc7aa8b817db"`);
        await queryRunner.query(`ALTER TABLE "workspace_members" DROP CONSTRAINT "FK_4a7c584ddfe855379598b5e20fd"`);
        await queryRunner.query(`ALTER TABLE "project" DROP CONSTRAINT "FK_5cb157e3d3ab8abd16251129dba"`);
        await queryRunner.query(`ALTER TABLE "project" DROP COLUMN "workspace_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4896b609c71ca5ad20ad662077"`);
        await queryRunner.query(`DROP TABLE "workspace_members"`);
        await queryRunner.query(`DROP TYPE "public"."workspace_members_role_enum"`);
        await queryRunner.query(`DROP TABLE "workspaces"`);
    }

}
