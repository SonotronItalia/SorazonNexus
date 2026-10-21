import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "marchio" ADD COLUMN "deleted_at" timestamp(3) with time zone;
  CREATE INDEX "marchio_deleted_at_idx" ON "marchio" USING btree ("deleted_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "marchio_deleted_at_idx";
  ALTER TABLE "marchio" DROP COLUMN "deleted_at";`)
}
