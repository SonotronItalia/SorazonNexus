import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_centri_regione" AS ENUM('Abruzzo', 'Basilicata', 'Calabria', 'Campania', 'Emilia-Romagna', 'Friuli-Venezia Giulia', 'Lazio', 'Liguria', 'Lombardia', 'Marche', 'Molise', 'Piemonte', 'Puglia', 'Sardegna', 'Sicilia', 'Toscana', 'Trentino-Alto Adige', 'Umbria', 'Valle d’Aosta', 'Veneto');
  ALTER TABLE "centri" ALTER COLUMN "regione" SET DATA TYPE "public"."enum_centri_regione" USING "regione"::"public"."enum_centri_regione";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "centri" ALTER COLUMN "regione" SET DATA TYPE varchar;
  DROP TYPE "public"."enum_centri_regione";`)
}
