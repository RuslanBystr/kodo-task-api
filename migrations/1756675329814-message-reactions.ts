import { MigrationInterface, QueryRunner } from "typeorm";

export class MessageReactions1756675329814 implements MigrationInterface {
    name = 'MessageReactions1756675329814'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "message_reaction" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "reaction" character varying(64) NOT NULL, "message_id" integer NOT NULL, "user_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_652ecdef048bbf25fe2055a5a87" UNIQUE ("message_id", "user_id", "reaction"), CONSTRAINT "PK_20b89d1447ef973e9f10973f220" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_c3aa2868fc9b2bc57d067642c5" ON "message_reaction" ("message_id") `);
        await queryRunner.query(`ALTER TABLE "message" DROP COLUMN "reaction"`);
        await queryRunner.query(`ALTER TABLE "message_reaction" ADD CONSTRAINT "FK_c3aa2868fc9b2bc57d067642c58" FOREIGN KEY ("message_id") REFERENCES "message"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "message_reaction" ADD CONSTRAINT "FK_14de7e1552e9b171172f8090b4f" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "message_reaction" DROP CONSTRAINT "FK_14de7e1552e9b171172f8090b4f"`);
        await queryRunner.query(`ALTER TABLE "message_reaction" DROP CONSTRAINT "FK_c3aa2868fc9b2bc57d067642c58"`);
        await queryRunner.query(`ALTER TABLE "message" ADD "reaction" character varying`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c3aa2868fc9b2bc57d067642c5"`);
        await queryRunner.query(`DROP TABLE "message_reaction"`);
    }

}
