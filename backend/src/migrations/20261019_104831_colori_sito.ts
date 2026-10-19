import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_cta_sfondo" AS ENUM('nessuno', 'tenue', 'scuro', 'colore');
  CREATE TYPE "public"."enum_pages_blocks_galleria_risultati_larghezza" AS ENUM('100', '75', '50');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_sfondo" AS ENUM('nessuno', 'tenue', 'scuro', 'colore');
  CREATE TYPE "public"."enum__pages_v_blocks_galleria_risultati_larghezza" AS ENUM('100', '75', '50');
  ALTER TYPE "public"."enum_pages_blocks_scheda_prodotto_sfondo" ADD VALUE 'colore';
  ALTER TYPE "public"."enum__pages_v_blocks_scheda_prodotto_sfondo" ADD VALUE 'colore';
  CREATE TABLE "colori" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nome" varchar NOT NULL,
  	"codice" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "pages_blocks_galleria_risultati" ALTER COLUMN "sfondo" SET DATA TYPE text;
  -- "celeste" non esiste più: diventa un colore della tavolozza (collegato in fondo)
  UPDATE "pages_blocks_galleria_risultati" SET "sfondo" = 'colore' WHERE "sfondo" = 'celeste';
  ALTER TABLE "pages_blocks_galleria_risultati" ALTER COLUMN "sfondo" SET DEFAULT 'nessuno'::text;
  DROP TYPE "public"."enum_pages_blocks_galleria_risultati_sfondo";
  CREATE TYPE "public"."enum_pages_blocks_galleria_risultati_sfondo" AS ENUM('nessuno', 'tenue', 'scuro', 'colore');
  ALTER TABLE "pages_blocks_galleria_risultati" ALTER COLUMN "sfondo" SET DEFAULT 'nessuno'::"public"."enum_pages_blocks_galleria_risultati_sfondo";
  ALTER TABLE "pages_blocks_galleria_risultati" ALTER COLUMN "sfondo" SET DATA TYPE "public"."enum_pages_blocks_galleria_risultati_sfondo" USING "sfondo"::"public"."enum_pages_blocks_galleria_risultati_sfondo";
  ALTER TABLE "_pages_v_blocks_galleria_risultati" ALTER COLUMN "sfondo" SET DATA TYPE text;
  -- "celeste" non esiste più: diventa un colore della tavolozza (collegato in fondo)
  UPDATE "_pages_v_blocks_galleria_risultati" SET "sfondo" = 'colore' WHERE "sfondo" = 'celeste';
  ALTER TABLE "_pages_v_blocks_galleria_risultati" ALTER COLUMN "sfondo" SET DEFAULT 'nessuno'::text;
  DROP TYPE "public"."enum__pages_v_blocks_galleria_risultati_sfondo";
  CREATE TYPE "public"."enum__pages_v_blocks_galleria_risultati_sfondo" AS ENUM('nessuno', 'tenue', 'scuro', 'colore');
  ALTER TABLE "_pages_v_blocks_galleria_risultati" ALTER COLUMN "sfondo" SET DEFAULT 'nessuno'::"public"."enum__pages_v_blocks_galleria_risultati_sfondo";
  ALTER TABLE "_pages_v_blocks_galleria_risultati" ALTER COLUMN "sfondo" SET DATA TYPE "public"."enum__pages_v_blocks_galleria_risultati_sfondo" USING "sfondo"::"public"."enum__pages_v_blocks_galleria_risultati_sfondo";
  ALTER TABLE "pages_blocks_cta" ADD COLUMN "sfondo" "enum_pages_blocks_cta_sfondo" DEFAULT 'nessuno';
  ALTER TABLE "pages_blocks_cta" ADD COLUMN "colore_id" integer;
  ALTER TABLE "pages_blocks_scheda_prodotto" ADD COLUMN "colore_id" integer;
  ALTER TABLE "pages_blocks_galleria_risultati" ADD COLUMN "larghezza" "enum_pages_blocks_galleria_risultati_larghezza" DEFAULT '100';
  ALTER TABLE "pages_blocks_galleria_risultati" ADD COLUMN "colore_id" integer;
  ALTER TABLE "pages_blocks_galleria_risultati" ADD COLUMN "schede_id" integer;
  ALTER TABLE "_pages_v_blocks_cta" ADD COLUMN "sfondo" "enum__pages_v_blocks_cta_sfondo" DEFAULT 'nessuno';
  ALTER TABLE "_pages_v_blocks_cta" ADD COLUMN "colore_id" integer;
  ALTER TABLE "_pages_v_blocks_scheda_prodotto" ADD COLUMN "colore_id" integer;
  ALTER TABLE "_pages_v_blocks_galleria_risultati" ADD COLUMN "larghezza" "enum__pages_v_blocks_galleria_risultati_larghezza" DEFAULT '100';
  ALTER TABLE "_pages_v_blocks_galleria_risultati" ADD COLUMN "colore_id" integer;
  ALTER TABLE "_pages_v_blocks_galleria_risultati" ADD COLUMN "schede_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "colori_id" integer;
  CREATE UNIQUE INDEX "colori_nome_idx" ON "colori" USING btree ("nome");
  CREATE INDEX "colori_updated_at_idx" ON "colori" USING btree ("updated_at");
  CREATE INDEX "colori_created_at_idx" ON "colori" USING btree ("created_at");
  ALTER TABLE "pages_blocks_cta" ADD CONSTRAINT "pages_blocks_cta_colore_id_colori_id_fk" FOREIGN KEY ("colore_id") REFERENCES "public"."colori"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_scheda_prodotto" ADD CONSTRAINT "pages_blocks_scheda_prodotto_colore_id_colori_id_fk" FOREIGN KEY ("colore_id") REFERENCES "public"."colori"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_galleria_risultati" ADD CONSTRAINT "pages_blocks_galleria_risultati_colore_id_colori_id_fk" FOREIGN KEY ("colore_id") REFERENCES "public"."colori"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_galleria_risultati" ADD CONSTRAINT "pages_blocks_galleria_risultati_schede_id_colori_id_fk" FOREIGN KEY ("schede_id") REFERENCES "public"."colori"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta" ADD CONSTRAINT "_pages_v_blocks_cta_colore_id_colori_id_fk" FOREIGN KEY ("colore_id") REFERENCES "public"."colori"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_scheda_prodotto" ADD CONSTRAINT "_pages_v_blocks_scheda_prodotto_colore_id_colori_id_fk" FOREIGN KEY ("colore_id") REFERENCES "public"."colori"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_galleria_risultati" ADD CONSTRAINT "_pages_v_blocks_galleria_risultati_colore_id_colori_id_fk" FOREIGN KEY ("colore_id") REFERENCES "public"."colori"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_galleria_risultati" ADD CONSTRAINT "_pages_v_blocks_galleria_risultati_schede_id_colori_id_fk" FOREIGN KEY ("schede_id") REFERENCES "public"."colori"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_colori_fk" FOREIGN KEY ("colori_id") REFERENCES "public"."colori"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_cta_colore_idx" ON "pages_blocks_cta" USING btree ("colore_id");
  CREATE INDEX "pages_blocks_scheda_prodotto_colore_idx" ON "pages_blocks_scheda_prodotto" USING btree ("colore_id");
  CREATE INDEX "pages_blocks_galleria_risultati_colore_idx" ON "pages_blocks_galleria_risultati" USING btree ("colore_id");
  CREATE INDEX "pages_blocks_galleria_risultati_schede_idx" ON "pages_blocks_galleria_risultati" USING btree ("schede_id");
  CREATE INDEX "_pages_v_blocks_cta_colore_idx" ON "_pages_v_blocks_cta" USING btree ("colore_id");
  CREATE INDEX "_pages_v_blocks_scheda_prodotto_colore_idx" ON "_pages_v_blocks_scheda_prodotto" USING btree ("colore_id");
  CREATE INDEX "_pages_v_blocks_galleria_risultati_colore_idx" ON "_pages_v_blocks_galleria_risultati" USING btree ("colore_id");
  CREATE INDEX "_pages_v_blocks_galleria_risultati_schede_idx" ON "_pages_v_blocks_galleria_risultati" USING btree ("schede_id");
  CREATE INDEX "payload_locked_documents_rels_colori_id_idx" ON "payload_locked_documents_rels" USING btree ("colori_id");
  -- Le gallerie che erano "celeste" usano il colore "Celeste Sorazon" della tavolozza
  INSERT INTO "colori" ("nome", "codice")
    SELECT 'Celeste Sorazon', '#0095AC'
    WHERE EXISTS (SELECT 1 FROM "pages_blocks_galleria_risultati" WHERE "sfondo" = 'colore')
       OR EXISTS (SELECT 1 FROM "_pages_v_blocks_galleria_risultati" WHERE "sfondo" = 'colore');
  UPDATE "pages_blocks_galleria_risultati" SET "colore_id" = (SELECT "id" FROM "colori" WHERE "nome" = 'Celeste Sorazon')
    WHERE "sfondo" = 'colore' AND "colore_id" IS NULL;
  UPDATE "_pages_v_blocks_galleria_risultati" SET "colore_id" = (SELECT "id" FROM "colori" WHERE "nome" = 'Celeste Sorazon')
    WHERE "sfondo" = 'colore' AND "colore_id" IS NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "colori" DISABLE ROW LEVEL SECURITY;
  -- CASCADE elimina già i vincoli verso "colori": sotto i DROP CONSTRAINT sono IF EXISTS
  DROP TABLE "colori" CASCADE;
  ALTER TABLE "pages_blocks_cta" DROP CONSTRAINT IF EXISTS "pages_blocks_cta_colore_id_colori_id_fk";
  
  ALTER TABLE "pages_blocks_scheda_prodotto" DROP CONSTRAINT IF EXISTS "pages_blocks_scheda_prodotto_colore_id_colori_id_fk";
  
  ALTER TABLE "pages_blocks_galleria_risultati" DROP CONSTRAINT IF EXISTS "pages_blocks_galleria_risultati_colore_id_colori_id_fk";
  
  ALTER TABLE "pages_blocks_galleria_risultati" DROP CONSTRAINT IF EXISTS "pages_blocks_galleria_risultati_schede_id_colori_id_fk";
  
  ALTER TABLE "_pages_v_blocks_cta" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_cta_colore_id_colori_id_fk";
  
  ALTER TABLE "_pages_v_blocks_scheda_prodotto" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_scheda_prodotto_colore_id_colori_id_fk";
  
  ALTER TABLE "_pages_v_blocks_galleria_risultati" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_galleria_risultati_colore_id_colori_id_fk";
  
  ALTER TABLE "_pages_v_blocks_galleria_risultati" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_galleria_risultati_schede_id_colori_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_colori_fk";
  
  ALTER TABLE "pages_blocks_scheda_prodotto" ALTER COLUMN "sfondo" SET DATA TYPE text;
  UPDATE "pages_blocks_scheda_prodotto" SET "sfondo" = 'nessuno' WHERE "sfondo" = 'colore';
  ALTER TABLE "pages_blocks_scheda_prodotto" ALTER COLUMN "sfondo" SET DEFAULT 'nessuno'::text;
  DROP TYPE "public"."enum_pages_blocks_scheda_prodotto_sfondo";
  CREATE TYPE "public"."enum_pages_blocks_scheda_prodotto_sfondo" AS ENUM('nessuno', 'tenue', 'scuro');
  ALTER TABLE "pages_blocks_scheda_prodotto" ALTER COLUMN "sfondo" SET DEFAULT 'nessuno'::"public"."enum_pages_blocks_scheda_prodotto_sfondo";
  ALTER TABLE "pages_blocks_scheda_prodotto" ALTER COLUMN "sfondo" SET DATA TYPE "public"."enum_pages_blocks_scheda_prodotto_sfondo" USING "sfondo"::"public"."enum_pages_blocks_scheda_prodotto_sfondo";
  ALTER TABLE "pages_blocks_galleria_risultati" ALTER COLUMN "sfondo" SET DATA TYPE text;
  UPDATE "pages_blocks_galleria_risultati" SET "sfondo" = 'celeste' WHERE "sfondo" = 'colore';
  ALTER TABLE "pages_blocks_galleria_risultati" ALTER COLUMN "sfondo" SET DEFAULT 'nessuno'::text;
  DROP TYPE "public"."enum_pages_blocks_galleria_risultati_sfondo";
  CREATE TYPE "public"."enum_pages_blocks_galleria_risultati_sfondo" AS ENUM('nessuno', 'tenue', 'scuro', 'celeste');
  ALTER TABLE "pages_blocks_galleria_risultati" ALTER COLUMN "sfondo" SET DEFAULT 'nessuno'::"public"."enum_pages_blocks_galleria_risultati_sfondo";
  ALTER TABLE "pages_blocks_galleria_risultati" ALTER COLUMN "sfondo" SET DATA TYPE "public"."enum_pages_blocks_galleria_risultati_sfondo" USING "sfondo"::"public"."enum_pages_blocks_galleria_risultati_sfondo";
  ALTER TABLE "_pages_v_blocks_scheda_prodotto" ALTER COLUMN "sfondo" SET DATA TYPE text;
  UPDATE "_pages_v_blocks_scheda_prodotto" SET "sfondo" = 'nessuno' WHERE "sfondo" = 'colore';
  ALTER TABLE "_pages_v_blocks_scheda_prodotto" ALTER COLUMN "sfondo" SET DEFAULT 'nessuno'::text;
  DROP TYPE "public"."enum__pages_v_blocks_scheda_prodotto_sfondo";
  CREATE TYPE "public"."enum__pages_v_blocks_scheda_prodotto_sfondo" AS ENUM('nessuno', 'tenue', 'scuro');
  ALTER TABLE "_pages_v_blocks_scheda_prodotto" ALTER COLUMN "sfondo" SET DEFAULT 'nessuno'::"public"."enum__pages_v_blocks_scheda_prodotto_sfondo";
  ALTER TABLE "_pages_v_blocks_scheda_prodotto" ALTER COLUMN "sfondo" SET DATA TYPE "public"."enum__pages_v_blocks_scheda_prodotto_sfondo" USING "sfondo"::"public"."enum__pages_v_blocks_scheda_prodotto_sfondo";
  ALTER TABLE "_pages_v_blocks_galleria_risultati" ALTER COLUMN "sfondo" SET DATA TYPE text;
  UPDATE "_pages_v_blocks_galleria_risultati" SET "sfondo" = 'celeste' WHERE "sfondo" = 'colore';
  ALTER TABLE "_pages_v_blocks_galleria_risultati" ALTER COLUMN "sfondo" SET DEFAULT 'nessuno'::text;
  DROP TYPE "public"."enum__pages_v_blocks_galleria_risultati_sfondo";
  CREATE TYPE "public"."enum__pages_v_blocks_galleria_risultati_sfondo" AS ENUM('nessuno', 'tenue', 'scuro', 'celeste');
  ALTER TABLE "_pages_v_blocks_galleria_risultati" ALTER COLUMN "sfondo" SET DEFAULT 'nessuno'::"public"."enum__pages_v_blocks_galleria_risultati_sfondo";
  ALTER TABLE "_pages_v_blocks_galleria_risultati" ALTER COLUMN "sfondo" SET DATA TYPE "public"."enum__pages_v_blocks_galleria_risultati_sfondo" USING "sfondo"::"public"."enum__pages_v_blocks_galleria_risultati_sfondo";
  DROP INDEX "pages_blocks_cta_colore_idx";
  DROP INDEX "pages_blocks_scheda_prodotto_colore_idx";
  DROP INDEX "pages_blocks_galleria_risultati_colore_idx";
  DROP INDEX "pages_blocks_galleria_risultati_schede_idx";
  DROP INDEX "_pages_v_blocks_cta_colore_idx";
  DROP INDEX "_pages_v_blocks_scheda_prodotto_colore_idx";
  DROP INDEX "_pages_v_blocks_galleria_risultati_colore_idx";
  DROP INDEX "_pages_v_blocks_galleria_risultati_schede_idx";
  DROP INDEX "payload_locked_documents_rels_colori_id_idx";
  ALTER TABLE "pages_blocks_cta" DROP COLUMN "sfondo";
  ALTER TABLE "pages_blocks_cta" DROP COLUMN "colore_id";
  ALTER TABLE "pages_blocks_scheda_prodotto" DROP COLUMN "colore_id";
  ALTER TABLE "pages_blocks_galleria_risultati" DROP COLUMN "larghezza";
  ALTER TABLE "pages_blocks_galleria_risultati" DROP COLUMN "colore_id";
  ALTER TABLE "pages_blocks_galleria_risultati" DROP COLUMN "schede_id";
  ALTER TABLE "_pages_v_blocks_cta" DROP COLUMN "sfondo";
  ALTER TABLE "_pages_v_blocks_cta" DROP COLUMN "colore_id";
  ALTER TABLE "_pages_v_blocks_scheda_prodotto" DROP COLUMN "colore_id";
  ALTER TABLE "_pages_v_blocks_galleria_risultati" DROP COLUMN "larghezza";
  ALTER TABLE "_pages_v_blocks_galleria_risultati" DROP COLUMN "colore_id";
  ALTER TABLE "_pages_v_blocks_galleria_risultati" DROP COLUMN "schede_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "colori_id";
  DROP TYPE "public"."enum_pages_blocks_cta_sfondo";
  DROP TYPE "public"."enum_pages_blocks_galleria_risultati_larghezza";
  DROP TYPE "public"."enum__pages_v_blocks_cta_sfondo";
  DROP TYPE "public"."enum__pages_v_blocks_galleria_risultati_larghezza";`)
}
