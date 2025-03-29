import { MigrationInterface, QueryRunner } from "typeorm";

export class MessageReadByUsers1743260326540 implements MigrationInterface {
    name = 'MessageReadByUsers1743260326540'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "message_read_by_users_user" ("messageId" integer NOT NULL, "userId" integer NOT NULL, CONSTRAINT "PK_9d4970e25900b113ed917d0b99c" PRIMARY KEY ("messageId", "userId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_c7678cdff03f516f48eb42aa09" ON "message_read_by_users_user" ("messageId") `);
        await queryRunner.query(`CREATE INDEX "IDX_bd0b041396d1d86bb57da07e02" ON "message_read_by_users_user" ("userId") `);
        await queryRunner.query(`ALTER TABLE "message_read_by_users_user" ADD CONSTRAINT "FK_c7678cdff03f516f48eb42aa094" FOREIGN KEY ("messageId") REFERENCES "message"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "message_read_by_users_user" ADD CONSTRAINT "FK_bd0b041396d1d86bb57da07e02c" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "message_read_by_users_user" DROP CONSTRAINT "FK_bd0b041396d1d86bb57da07e02c"`);
        await queryRunner.query(`ALTER TABLE "message_read_by_users_user" DROP CONSTRAINT "FK_c7678cdff03f516f48eb42aa094"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bd0b041396d1d86bb57da07e02"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c7678cdff03f516f48eb42aa09"`);
        await queryRunner.query(`DROP TABLE "message_read_by_users_user"`);
    }

}
