import { MigrationInterface, QueryRunner } from 'typeorm';

export class ProjectOwnerStatus1756669039449 implements MigrationInterface {
    name = 'ProjectOwnerStatus1756669039449'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "project" ADD "owner_id" integer`);
        await queryRunner.query(`CREATE TYPE "public"."project_status_enum" AS ENUM('Active', 'Inactive', 'Completed')`);
        await queryRunner.query(`ALTER TABLE "project" ADD "status" "public"."project_status_enum" NOT NULL DEFAULT 'Active'`);
        await queryRunner.query(`CREATE TYPE "public"."project_visibility_enum" AS ENUM('Private', 'Internal', 'Public')`);
        await queryRunner.query(`ALTER TABLE "project" ADD "visibility" "public"."project_visibility_enum" NOT NULL DEFAULT 'Private'`);
        await queryRunner.query(`ALTER TABLE "project" ADD CONSTRAINT "FK_d40afe32d1d771bea7a5f468185" FOREIGN KEY ("owner_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "project" DROP CONSTRAINT "FK_d40afe32d1d771bea7a5f468185"`);
        await queryRunner.query(`ALTER TABLE "project" DROP COLUMN "visibility"`);
        await queryRunner.query(`DROP TYPE "public"."project_visibility_enum"`);
        await queryRunner.query(`ALTER TABLE "project" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."project_status_enum"`);
        await queryRunner.query(`ALTER TABLE "project" DROP COLUMN "owner_id"`);
    }

}
