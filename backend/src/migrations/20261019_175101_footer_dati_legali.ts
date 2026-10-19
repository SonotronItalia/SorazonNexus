import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "footer" ADD COLUMN "dati_legali_ragione_sociale" varchar;
  ALTER TABLE "footer" ADD COLUMN "dati_legali_indirizzo" varchar;
  ALTER TABLE "footer" ADD COLUMN "dati_legali_partita_iva" varchar;
  ALTER TABLE "footer" ADD COLUMN "dati_legali_codice_fiscale" varchar;
  ALTER TABLE "footer" ADD COLUMN "dati_legali_rea" varchar;
  ALTER TABLE "footer" ADD COLUMN "dati_legali_pec" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "footer" DROP COLUMN "dati_legali_ragione_sociale";
  ALTER TABLE "footer" DROP COLUMN "dati_legali_indirizzo";
  ALTER TABLE "footer" DROP COLUMN "dati_legali_partita_iva";
  ALTER TABLE "footer" DROP COLUMN "dati_legali_codice_fiscale";
  ALTER TABLE "footer" DROP COLUMN "dati_legali_rea";
  ALTER TABLE "footer" DROP COLUMN "dati_legali_pec";`)
}
