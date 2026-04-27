import { MigrationInterface, QueryRunner } from "typeorm";

export class WorkspaceCountMembers1777199090890 implements MigrationInterface {
    name = 'WorkspaceCountMembers1777199090890'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "workspaces" ADD "totalMembers" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "workspaces" DROP COLUMN "totalMembers"`);
    }

}
