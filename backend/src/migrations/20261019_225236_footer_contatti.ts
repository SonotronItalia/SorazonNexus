import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "footer" ADD COLUMN "dati_legali_telefono" varchar;
  ALTER TABLE "footer" ADD COLUMN "dati_legali_email" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "footer" DROP COLUMN "dati_legali_telefono";
  ALTER TABLE "footer" DROP COLUMN "dati_legali_email";`)
}
