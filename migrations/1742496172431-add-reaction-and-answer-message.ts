import { MigrationInterface, QueryRunner } from "typeorm";

export class AddReactionAndAnswerMessage1742496172431 implements MigrationInterface {
    name = 'AddReactionAndAnswerMessage1742496172431'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "message" ADD "reaction" character varying`);
        await queryRunner.query(`ALTER TABLE "message" ADD "linkToMessageId" integer`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_fc803c0562b3a3be4ca1cb04a38" FOREIGN KEY ("linkToMessageId") REFERENCES "message"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_fc803c0562b3a3be4ca1cb04a38"`);
        await queryRunner.query(`ALTER TABLE "message" DROP COLUMN "linkToMessageId"`);
        await queryRunner.query(`ALTER TABLE "message" DROP COLUMN "reaction"`);
    }

}
