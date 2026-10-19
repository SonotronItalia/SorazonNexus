import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_contenitore3_colonne_larghezza" AS ENUM('auto', '25', '33', '50', '66', '75');
  CREATE TYPE "public"."enum_pages_blocks_contenitore3_larghezza" AS ENUM('100', '90', '80', '70', '60', '50', '40', '30');
  CREATE TYPE "public"."enum_pages_blocks_contenitore3_allineamento" AS ENUM('inizio', 'centro', 'fine');
  CREATE TYPE "public"."enum_pages_blocks_contenitore3_spazio_colonne" AS ENUM('nessuno', 'piccolo', 'medio', 'grande');
  CREATE TYPE "public"."enum_pages_blocks_contenitore3_spazio_verticale" AS ENUM('nessuno', 'piccolo', 'medio', 'grande');
  CREATE TYPE "public"."enum_pages_blocks_contenitore3_sfondo" AS ENUM('nessuno', 'tenue', 'scuro', 'colore');
  CREATE TYPE "public"."enum_pages_blocks_contenitore2_colonne_larghezza" AS ENUM('auto', '25', '33', '50', '66', '75');
  CREATE TYPE "public"."enum_pages_blocks_contenitore2_larghezza" AS ENUM('100', '90', '80', '70', '60', '50', '40', '30');
  CREATE TYPE "public"."enum_pages_blocks_contenitore2_allineamento" AS ENUM('inizio', 'centro', 'fine');
  CREATE TYPE "public"."enum_pages_blocks_contenitore2_spazio_colonne" AS ENUM('nessuno', 'piccolo', 'medio', 'grande');
  CREATE TYPE "public"."enum_pages_blocks_contenitore2_spazio_verticale" AS ENUM('nessuno', 'piccolo', 'medio', 'grande');
  CREATE TYPE "public"."enum_pages_blocks_contenitore2_sfondo" AS ENUM('nessuno', 'tenue', 'scuro', 'colore');
  CREATE TYPE "public"."enum_pages_blocks_contenitore_colonne_larghezza" AS ENUM('auto', '25', '33', '50', '66', '75');
  CREATE TYPE "public"."enum_pages_blocks_contenitore_larghezza" AS ENUM('100', '90', '80', '70', '60', '50', '40', '30');
  CREATE TYPE "public"."enum_pages_blocks_contenitore_allineamento" AS ENUM('inizio', 'centro', 'fine');
  CREATE TYPE "public"."enum_pages_blocks_contenitore_spazio_colonne" AS ENUM('nessuno', 'piccolo', 'medio', 'grande');
  CREATE TYPE "public"."enum_pages_blocks_contenitore_spazio_verticale" AS ENUM('nessuno', 'piccolo', 'medio', 'grande');
  CREATE TYPE "public"."enum_pages_blocks_contenitore_sfondo" AS ENUM('nessuno', 'tenue', 'scuro', 'colore');
  CREATE TYPE "public"."enum__pages_v_blocks_contenitore3_colonne_larghezza" AS ENUM('auto', '25', '33', '50', '66', '75');
  CREATE TYPE "public"."enum__pages_v_blocks_contenitore3_larghezza" AS ENUM('100', '90', '80', '70', '60', '50', '40', '30');
  CREATE TYPE "public"."enum__pages_v_blocks_contenitore3_allineamento" AS ENUM('inizio', 'centro', 'fine');
  CREATE TYPE "public"."enum__pages_v_blocks_contenitore3_spazio_colonne" AS ENUM('nessuno', 'piccolo', 'medio', 'grande');
  CREATE TYPE "public"."enum__pages_v_blocks_contenitore3_spazio_verticale" AS ENUM('nessuno', 'piccolo', 'medio', 'grande');
  CREATE TYPE "public"."enum__pages_v_blocks_contenitore3_sfondo" AS ENUM('nessuno', 'tenue', 'scuro', 'colore');
  CREATE TYPE "public"."enum__pages_v_blocks_contenitore2_colonne_larghezza" AS ENUM('auto', '25', '33', '50', '66', '75');
  CREATE TYPE "public"."enum__pages_v_blocks_contenitore2_larghezza" AS ENUM('100', '90', '80', '70', '60', '50', '40', '30');
  CREATE TYPE "public"."enum__pages_v_blocks_contenitore2_allineamento" AS ENUM('inizio', 'centro', 'fine');
  CREATE TYPE "public"."enum__pages_v_blocks_contenitore2_spazio_colonne" AS ENUM('nessuno', 'piccolo', 'medio', 'grande');
  CREATE TYPE "public"."enum__pages_v_blocks_contenitore2_spazio_verticale" AS ENUM('nessuno', 'piccolo', 'medio', 'grande');
  CREATE TYPE "public"."enum__pages_v_blocks_contenitore2_sfondo" AS ENUM('nessuno', 'tenue', 'scuro', 'colore');
  CREATE TYPE "public"."enum__pages_v_blocks_contenitore_colonne_larghezza" AS ENUM('auto', '25', '33', '50', '66', '75');
  CREATE TYPE "public"."enum__pages_v_blocks_contenitore_larghezza" AS ENUM('100', '90', '80', '70', '60', '50', '40', '30');
  CREATE TYPE "public"."enum__pages_v_blocks_contenitore_allineamento" AS ENUM('inizio', 'centro', 'fine');
  CREATE TYPE "public"."enum__pages_v_blocks_contenitore_spazio_colonne" AS ENUM('nessuno', 'piccolo', 'medio', 'grande');
  CREATE TYPE "public"."enum__pages_v_blocks_contenitore_spazio_verticale" AS ENUM('nessuno', 'piccolo', 'medio', 'grande');
  CREATE TYPE "public"."enum__pages_v_blocks_contenitore_sfondo" AS ENUM('nessuno', 'tenue', 'scuro', 'colore');
  CREATE TABLE "pages_blocks_contenitore3_colonne" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"larghezza" "enum_pages_blocks_contenitore3_colonne_larghezza" DEFAULT 'auto'
  );
  
  CREATE TABLE "pages_blocks_contenitore3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"larghezza" "enum_pages_blocks_contenitore3_larghezza" DEFAULT '100',
  	"allineamento" "enum_pages_blocks_contenitore3_allineamento" DEFAULT 'inizio',
  	"spazio_colonne" "enum_pages_blocks_contenitore3_spazio_colonne" DEFAULT 'medio',
  	"spazio_verticale" "enum_pages_blocks_contenitore3_spazio_verticale" DEFAULT 'nessuno',
  	"sfondo" "enum_pages_blocks_contenitore3_sfondo" DEFAULT 'nessuno',
  	"colore_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_contenitore2_colonne" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"larghezza" "enum_pages_blocks_contenitore2_colonne_larghezza" DEFAULT 'auto'
  );
  
  CREATE TABLE "pages_blocks_contenitore2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"larghezza" "enum_pages_blocks_contenitore2_larghezza" DEFAULT '100',
  	"allineamento" "enum_pages_blocks_contenitore2_allineamento" DEFAULT 'inizio',
  	"spazio_colonne" "enum_pages_blocks_contenitore2_spazio_colonne" DEFAULT 'medio',
  	"spazio_verticale" "enum_pages_blocks_contenitore2_spazio_verticale" DEFAULT 'nessuno',
  	"sfondo" "enum_pages_blocks_contenitore2_sfondo" DEFAULT 'nessuno',
  	"colore_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_contenitore_colonne" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"larghezza" "enum_pages_blocks_contenitore_colonne_larghezza" DEFAULT 'auto'
  );
  
  CREATE TABLE "pages_blocks_contenitore" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"larghezza" "enum_pages_blocks_contenitore_larghezza" DEFAULT '100',
  	"allineamento" "enum_pages_blocks_contenitore_allineamento" DEFAULT 'inizio',
  	"spazio_colonne" "enum_pages_blocks_contenitore_spazio_colonne" DEFAULT 'medio',
  	"spazio_verticale" "enum_pages_blocks_contenitore_spazio_verticale" DEFAULT 'nessuno',
  	"sfondo" "enum_pages_blocks_contenitore_sfondo" DEFAULT 'nessuno',
  	"colore_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_contenitore3_colonne" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"larghezza" "enum__pages_v_blocks_contenitore3_colonne_larghezza" DEFAULT 'auto',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_contenitore3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"larghezza" "enum__pages_v_blocks_contenitore3_larghezza" DEFAULT '100',
  	"allineamento" "enum__pages_v_blocks_contenitore3_allineamento" DEFAULT 'inizio',
  	"spazio_colonne" "enum__pages_v_blocks_contenitore3_spazio_colonne" DEFAULT 'medio',
  	"spazio_verticale" "enum__pages_v_blocks_contenitore3_spazio_verticale" DEFAULT 'nessuno',
  	"sfondo" "enum__pages_v_blocks_contenitore3_sfondo" DEFAULT 'nessuno',
  	"colore_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_contenitore2_colonne" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"larghezza" "enum__pages_v_blocks_contenitore2_colonne_larghezza" DEFAULT 'auto',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_contenitore2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"larghezza" "enum__pages_v_blocks_contenitore2_larghezza" DEFAULT '100',
  	"allineamento" "enum__pages_v_blocks_contenitore2_allineamento" DEFAULT 'inizio',
  	"spazio_colonne" "enum__pages_v_blocks_contenitore2_spazio_colonne" DEFAULT 'medio',
  	"spazio_verticale" "enum__pages_v_blocks_contenitore2_spazio_verticale" DEFAULT 'nessuno',
  	"sfondo" "enum__pages_v_blocks_contenitore2_sfondo" DEFAULT 'nessuno',
  	"colore_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_contenitore_colonne" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"larghezza" "enum__pages_v_blocks_contenitore_colonne_larghezza" DEFAULT 'auto',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_contenitore" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"larghezza" "enum__pages_v_blocks_contenitore_larghezza" DEFAULT '100',
  	"allineamento" "enum__pages_v_blocks_contenitore_allineamento" DEFAULT 'inizio',
  	"spazio_colonne" "enum__pages_v_blocks_contenitore_spazio_colonne" DEFAULT 'medio',
  	"spazio_verticale" "enum__pages_v_blocks_contenitore_spazio_verticale" DEFAULT 'nessuno',
  	"sfondo" "enum__pages_v_blocks_contenitore_sfondo" DEFAULT 'nessuno',
  	"colore_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_galleria_risultati" ALTER COLUMN "larghezza" SET DATA TYPE text;
  -- Larghezze ora a passi di 10: 75% diventa 80%
  UPDATE "pages_blocks_galleria_risultati" SET "larghezza" = '80' WHERE "larghezza" = '75';
  ALTER TABLE "pages_blocks_galleria_risultati" ALTER COLUMN "larghezza" SET DEFAULT '100'::text;
  DROP TYPE "public"."enum_pages_blocks_galleria_risultati_larghezza";
  CREATE TYPE "public"."enum_pages_blocks_galleria_risultati_larghezza" AS ENUM('100', '90', '80', '70', '60', '50', '40', '30');
  ALTER TABLE "pages_blocks_galleria_risultati" ALTER COLUMN "larghezza" SET DEFAULT '100'::"public"."enum_pages_blocks_galleria_risultati_larghezza";
  ALTER TABLE "pages_blocks_galleria_risultati" ALTER COLUMN "larghezza" SET DATA TYPE "public"."enum_pages_blocks_galleria_risultati_larghezza" USING "larghezza"::"public"."enum_pages_blocks_galleria_risultati_larghezza";
  ALTER TABLE "_pages_v_blocks_galleria_risultati" ALTER COLUMN "larghezza" SET DATA TYPE text;
  -- Larghezze ora a passi di 10: 75% diventa 80%
  UPDATE "_pages_v_blocks_galleria_risultati" SET "larghezza" = '80' WHERE "larghezza" = '75';
  ALTER TABLE "_pages_v_blocks_galleria_risultati" ALTER COLUMN "larghezza" SET DEFAULT '100'::text;
  DROP TYPE "public"."enum__pages_v_blocks_galleria_risultati_larghezza";
  CREATE TYPE "public"."enum__pages_v_blocks_galleria_risultati_larghezza" AS ENUM('100', '90', '80', '70', '60', '50', '40', '30');
  ALTER TABLE "_pages_v_blocks_galleria_risultati" ALTER COLUMN "larghezza" SET DEFAULT '100'::"public"."enum__pages_v_blocks_galleria_risultati_larghezza";
  ALTER TABLE "_pages_v_blocks_galleria_risultati" ALTER COLUMN "larghezza" SET DATA TYPE "public"."enum__pages_v_blocks_galleria_risultati_larghezza" USING "larghezza"::"public"."enum__pages_v_blocks_galleria_risultati_larghezza";
  ALTER TABLE "pages_blocks_contenitore3_colonne" ADD CONSTRAINT "pages_blocks_contenitore3_colonne_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_contenitore3"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_contenitore3" ADD CONSTRAINT "pages_blocks_contenitore3_colore_id_colori_id_fk" FOREIGN KEY ("colore_id") REFERENCES "public"."colori"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_contenitore3" ADD CONSTRAINT "pages_blocks_contenitore3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_contenitore2_colonne" ADD CONSTRAINT "pages_blocks_contenitore2_colonne_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_contenitore2"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_contenitore2" ADD CONSTRAINT "pages_blocks_contenitore2_colore_id_colori_id_fk" FOREIGN KEY ("colore_id") REFERENCES "public"."colori"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_contenitore2" ADD CONSTRAINT "pages_blocks_contenitore2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_contenitore_colonne" ADD CONSTRAINT "pages_blocks_contenitore_colonne_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_contenitore"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_contenitore" ADD CONSTRAINT "pages_blocks_contenitore_colore_id_colori_id_fk" FOREIGN KEY ("colore_id") REFERENCES "public"."colori"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_contenitore" ADD CONSTRAINT "pages_blocks_contenitore_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contenitore3_colonne" ADD CONSTRAINT "_pages_v_blocks_contenitore3_colonne_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_contenitore3"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contenitore3" ADD CONSTRAINT "_pages_v_blocks_contenitore3_colore_id_colori_id_fk" FOREIGN KEY ("colore_id") REFERENCES "public"."colori"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contenitore3" ADD CONSTRAINT "_pages_v_blocks_contenitore3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contenitore2_colonne" ADD CONSTRAINT "_pages_v_blocks_contenitore2_colonne_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_contenitore2"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contenitore2" ADD CONSTRAINT "_pages_v_blocks_contenitore2_colore_id_colori_id_fk" FOREIGN KEY ("colore_id") REFERENCES "public"."colori"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contenitore2" ADD CONSTRAINT "_pages_v_blocks_contenitore2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contenitore_colonne" ADD CONSTRAINT "_pages_v_blocks_contenitore_colonne_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_contenitore"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contenitore" ADD CONSTRAINT "_pages_v_blocks_contenitore_colore_id_colori_id_fk" FOREIGN KEY ("colore_id") REFERENCES "public"."colori"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contenitore" ADD CONSTRAINT "_pages_v_blocks_contenitore_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_contenitore3_colonne_order_idx" ON "pages_blocks_contenitore3_colonne" USING btree ("_order");
  CREATE INDEX "pages_blocks_contenitore3_colonne_parent_id_idx" ON "pages_blocks_contenitore3_colonne" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_contenitore3_order_idx" ON "pages_blocks_contenitore3" USING btree ("_order");
  CREATE INDEX "pages_blocks_contenitore3_parent_id_idx" ON "pages_blocks_contenitore3" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_contenitore3_path_idx" ON "pages_blocks_contenitore3" USING btree ("_path");
  CREATE INDEX "pages_blocks_contenitore3_colore_idx" ON "pages_blocks_contenitore3" USING btree ("colore_id");
  CREATE INDEX "pages_blocks_contenitore2_colonne_order_idx" ON "pages_blocks_contenitore2_colonne" USING btree ("_order");
  CREATE INDEX "pages_blocks_contenitore2_colonne_parent_id_idx" ON "pages_blocks_contenitore2_colonne" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_contenitore2_order_idx" ON "pages_blocks_contenitore2" USING btree ("_order");
  CREATE INDEX "pages_blocks_contenitore2_parent_id_idx" ON "pages_blocks_contenitore2" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_contenitore2_path_idx" ON "pages_blocks_contenitore2" USING btree ("_path");
  CREATE INDEX "pages_blocks_contenitore2_colore_idx" ON "pages_blocks_contenitore2" USING btree ("colore_id");
  CREATE INDEX "pages_blocks_contenitore_colonne_order_idx" ON "pages_blocks_contenitore_colonne" USING btree ("_order");
  CREATE INDEX "pages_blocks_contenitore_colonne_parent_id_idx" ON "pages_blocks_contenitore_colonne" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_contenitore_order_idx" ON "pages_blocks_contenitore" USING btree ("_order");
  CREATE INDEX "pages_blocks_contenitore_parent_id_idx" ON "pages_blocks_contenitore" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_contenitore_path_idx" ON "pages_blocks_contenitore" USING btree ("_path");
  CREATE INDEX "pages_blocks_contenitore_colore_idx" ON "pages_blocks_contenitore" USING btree ("colore_id");
  CREATE INDEX "_pages_v_blocks_contenitore3_colonne_order_idx" ON "_pages_v_blocks_contenitore3_colonne" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_contenitore3_colonne_parent_id_idx" ON "_pages_v_blocks_contenitore3_colonne" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_contenitore3_order_idx" ON "_pages_v_blocks_contenitore3" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_contenitore3_parent_id_idx" ON "_pages_v_blocks_contenitore3" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_contenitore3_path_idx" ON "_pages_v_blocks_contenitore3" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_contenitore3_colore_idx" ON "_pages_v_blocks_contenitore3" USING btree ("colore_id");
  CREATE INDEX "_pages_v_blocks_contenitore2_colonne_order_idx" ON "_pages_v_blocks_contenitore2_colonne" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_contenitore2_colonne_parent_id_idx" ON "_pages_v_blocks_contenitore2_colonne" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_contenitore2_order_idx" ON "_pages_v_blocks_contenitore2" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_contenitore2_parent_id_idx" ON "_pages_v_blocks_contenitore2" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_contenitore2_path_idx" ON "_pages_v_blocks_contenitore2" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_contenitore2_colore_idx" ON "_pages_v_blocks_contenitore2" USING btree ("colore_id");
  CREATE INDEX "_pages_v_blocks_contenitore_colonne_order_idx" ON "_pages_v_blocks_contenitore_colonne" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_contenitore_colonne_parent_id_idx" ON "_pages_v_blocks_contenitore_colonne" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_contenitore_order_idx" ON "_pages_v_blocks_contenitore" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_contenitore_parent_id_idx" ON "_pages_v_blocks_contenitore" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_contenitore_path_idx" ON "_pages_v_blocks_contenitore" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_contenitore_colore_idx" ON "_pages_v_blocks_contenitore" USING btree ("colore_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_contenitore3_colonne" CASCADE;
  DROP TABLE "pages_blocks_contenitore3" CASCADE;
  DROP TABLE "pages_blocks_contenitore2_colonne" CASCADE;
  DROP TABLE "pages_blocks_contenitore2" CASCADE;
  DROP TABLE "pages_blocks_contenitore_colonne" CASCADE;
  DROP TABLE "pages_blocks_contenitore" CASCADE;
  DROP TABLE "_pages_v_blocks_contenitore3_colonne" CASCADE;
  DROP TABLE "_pages_v_blocks_contenitore3" CASCADE;
  DROP TABLE "_pages_v_blocks_contenitore2_colonne" CASCADE;
  DROP TABLE "_pages_v_blocks_contenitore2" CASCADE;
  DROP TABLE "_pages_v_blocks_contenitore_colonne" CASCADE;
  DROP TABLE "_pages_v_blocks_contenitore" CASCADE;
  ALTER TABLE "pages_blocks_galleria_risultati" ALTER COLUMN "larghezza" SET DATA TYPE text;
  UPDATE "pages_blocks_galleria_risultati" SET "larghezza" = CASE WHEN "larghezza" = '90' THEN '100' WHEN "larghezza" IN ('80', '70') THEN '75' WHEN "larghezza" IN ('60', '40', '30') THEN '50' ELSE "larghezza" END;
  ALTER TABLE "pages_blocks_galleria_risultati" ALTER COLUMN "larghezza" SET DEFAULT '100'::text;
  DROP TYPE "public"."enum_pages_blocks_galleria_risultati_larghezza";
  CREATE TYPE "public"."enum_pages_blocks_galleria_risultati_larghezza" AS ENUM('100', '75', '50');
  ALTER TABLE "pages_blocks_galleria_risultati" ALTER COLUMN "larghezza" SET DEFAULT '100'::"public"."enum_pages_blocks_galleria_risultati_larghezza";
  ALTER TABLE "pages_blocks_galleria_risultati" ALTER COLUMN "larghezza" SET DATA TYPE "public"."enum_pages_blocks_galleria_risultati_larghezza" USING "larghezza"::"public"."enum_pages_blocks_galleria_risultati_larghezza";
  ALTER TABLE "_pages_v_blocks_galleria_risultati" ALTER COLUMN "larghezza" SET DATA TYPE text;
  UPDATE "_pages_v_blocks_galleria_risultati" SET "larghezza" = CASE WHEN "larghezza" = '90' THEN '100' WHEN "larghezza" IN ('80', '70') THEN '75' WHEN "larghezza" IN ('60', '40', '30') THEN '50' ELSE "larghezza" END;
  ALTER TABLE "_pages_v_blocks_galleria_risultati" ALTER COLUMN "larghezza" SET DEFAULT '100'::text;
  DROP TYPE "public"."enum__pages_v_blocks_galleria_risultati_larghezza";
  CREATE TYPE "public"."enum__pages_v_blocks_galleria_risultati_larghezza" AS ENUM('100', '75', '50');
  ALTER TABLE "_pages_v_blocks_galleria_risultati" ALTER COLUMN "larghezza" SET DEFAULT '100'::"public"."enum__pages_v_blocks_galleria_risultati_larghezza";
  ALTER TABLE "_pages_v_blocks_galleria_risultati" ALTER COLUMN "larghezza" SET DATA TYPE "public"."enum__pages_v_blocks_galleria_risultati_larghezza" USING "larghezza"::"public"."enum__pages_v_blocks_galleria_risultati_larghezza";
  DROP TYPE "public"."enum_pages_blocks_contenitore3_colonne_larghezza";
  DROP TYPE "public"."enum_pages_blocks_contenitore3_larghezza";
  DROP TYPE "public"."enum_pages_blocks_contenitore3_allineamento";
  DROP TYPE "public"."enum_pages_blocks_contenitore3_spazio_colonne";
  DROP TYPE "public"."enum_pages_blocks_contenitore3_spazio_verticale";
  DROP TYPE "public"."enum_pages_blocks_contenitore3_sfondo";
  DROP TYPE "public"."enum_pages_blocks_contenitore2_colonne_larghezza";
  DROP TYPE "public"."enum_pages_blocks_contenitore2_larghezza";
  DROP TYPE "public"."enum_pages_blocks_contenitore2_allineamento";
  DROP TYPE "public"."enum_pages_blocks_contenitore2_spazio_colonne";
  DROP TYPE "public"."enum_pages_blocks_contenitore2_spazio_verticale";
  DROP TYPE "public"."enum_pages_blocks_contenitore2_sfondo";
  DROP TYPE "public"."enum_pages_blocks_contenitore_colonne_larghezza";
  DROP TYPE "public"."enum_pages_blocks_contenitore_larghezza";
  DROP TYPE "public"."enum_pages_blocks_contenitore_allineamento";
  DROP TYPE "public"."enum_pages_blocks_contenitore_spazio_colonne";
  DROP TYPE "public"."enum_pages_blocks_contenitore_spazio_verticale";
  DROP TYPE "public"."enum_pages_blocks_contenitore_sfondo";
  DROP TYPE "public"."enum__pages_v_blocks_contenitore3_colonne_larghezza";
  DROP TYPE "public"."enum__pages_v_blocks_contenitore3_larghezza";
  DROP TYPE "public"."enum__pages_v_blocks_contenitore3_allineamento";
  DROP TYPE "public"."enum__pages_v_blocks_contenitore3_spazio_colonne";
  DROP TYPE "public"."enum__pages_v_blocks_contenitore3_spazio_verticale";
  DROP TYPE "public"."enum__pages_v_blocks_contenitore3_sfondo";
  DROP TYPE "public"."enum__pages_v_blocks_contenitore2_colonne_larghezza";
  DROP TYPE "public"."enum__pages_v_blocks_contenitore2_larghezza";
  DROP TYPE "public"."enum__pages_v_blocks_contenitore2_allineamento";
  DROP TYPE "public"."enum__pages_v_blocks_contenitore2_spazio_colonne";
  DROP TYPE "public"."enum__pages_v_blocks_contenitore2_spazio_verticale";
  DROP TYPE "public"."enum__pages_v_blocks_contenitore2_sfondo";
  DROP TYPE "public"."enum__pages_v_blocks_contenitore_colonne_larghezza";
  DROP TYPE "public"."enum__pages_v_blocks_contenitore_larghezza";
  DROP TYPE "public"."enum__pages_v_blocks_contenitore_allineamento";
  DROP TYPE "public"."enum__pages_v_blocks_contenitore_spazio_colonne";
  DROP TYPE "public"."enum__pages_v_blocks_contenitore_spazio_verticale";
  DROP TYPE "public"."enum__pages_v_blocks_contenitore_sfondo";`)
}
