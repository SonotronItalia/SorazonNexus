import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users" DROP COLUMN "ruolo";
  DROP TYPE "public"."enum_users_ruolo";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_ruolo" AS ENUM('amministratore', 'redattore');
  ALTER TABLE "users" ADD COLUMN "ruolo" "enum_users_ruolo";`)
}
