import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAndVerifyUser1740301060631 implements MigrationInterface {
    name = 'CreateAndVerifyUser1740301060631'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "first_name" character varying, "last_name" character varying, "phone" character varying, "email" character varying NOT NULL, "password" character varying, "status" boolean NOT NULL DEFAULT true, "role" character varying NOT NULL DEFAULT 'USER', "is_blocked" boolean NOT NULL DEFAULT false, "currentHashedRefreshToken" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_verification" ("id" SERIAL NOT NULL, "code" character varying NOT NULL, "expired_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "email" character varying, "user_id" integer, CONSTRAINT "PK_679edeb6fcfcbc4c094573e27e7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user_verification" ADD CONSTRAINT "FK_3d40c1993bffba775f0ffad0cae" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_verification" DROP CONSTRAINT "FK_3d40c1993bffba775f0ffad0cae"`);
        await queryRunner.query(`DROP TABLE "user_verification"`);
        await queryRunner.query(`DROP TABLE "user"`);
    }

}
