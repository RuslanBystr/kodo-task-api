import { MigrationInterface, QueryRunner } from "typeorm";

export class ChatAvatar1740848332907 implements MigrationInterface {
    name = 'ChatAvatar1740848332907'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_chat" ADD "avatar" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_chat" DROP COLUMN "avatar"`);
    }

}
