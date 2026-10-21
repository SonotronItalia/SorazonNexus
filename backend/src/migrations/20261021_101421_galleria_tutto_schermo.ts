import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_pages_blocks_galleria_risultati_larghezza" ADD VALUE 'schermo' BEFORE '100';
  ALTER TYPE "public"."enum__pages_v_blocks_galleria_risultati_larghezza" ADD VALUE 'schermo' BEFORE '100';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // "Tutto lo schermo" torna a 100% prima di togliere il valore dall'elenco
  await db.execute(sql`
   UPDATE "pages_blocks_galleria_risultati" SET "larghezza" = '100' WHERE "larghezza" = 'schermo';
  UPDATE "_pages_v_blocks_galleria_risultati" SET "larghezza" = '100' WHERE "larghezza" = 'schermo';
   ALTER TABLE "pages_blocks_galleria_risultati" ALTER COLUMN "larghezza" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_galleria_risultati" ALTER COLUMN "larghezza" SET DEFAULT '100'::text;
  DROP TYPE "public"."enum_pages_blocks_galleria_risultati_larghezza";
  CREATE TYPE "public"."enum_pages_blocks_galleria_risultati_larghezza" AS ENUM('100', '90', '80', '70', '60', '50', '40', '30');
  ALTER TABLE "pages_blocks_galleria_risultati" ALTER COLUMN "larghezza" SET DEFAULT '100'::"public"."enum_pages_blocks_galleria_risultati_larghezza";
  ALTER TABLE "pages_blocks_galleria_risultati" ALTER COLUMN "larghezza" SET DATA TYPE "public"."enum_pages_blocks_galleria_risultati_larghezza" USING "larghezza"::"public"."enum_pages_blocks_galleria_risultati_larghezza";
  ALTER TABLE "_pages_v_blocks_galleria_risultati" ALTER COLUMN "larghezza" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_galleria_risultati" ALTER COLUMN "larghezza" SET DEFAULT '100'::text;
  DROP TYPE "public"."enum__pages_v_blocks_galleria_risultati_larghezza";
  CREATE TYPE "public"."enum__pages_v_blocks_galleria_risultati_larghezza" AS ENUM('100', '90', '80', '70', '60', '50', '40', '30');
  ALTER TABLE "_pages_v_blocks_galleria_risultati" ALTER COLUMN "larghezza" SET DEFAULT '100'::"public"."enum__pages_v_blocks_galleria_risultati_larghezza";
  ALTER TABLE "_pages_v_blocks_galleria_risultati" ALTER COLUMN "larghezza" SET DATA TYPE "public"."enum__pages_v_blocks_galleria_risultati_larghezza" USING "larghezza"::"public"."enum__pages_v_blocks_galleria_risultati_larghezza";`)
}
