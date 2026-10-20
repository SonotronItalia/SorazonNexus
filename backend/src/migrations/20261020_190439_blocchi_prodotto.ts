import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_numeri_evidenza_voci_tipo" AS ENUM('manuale', 'centri', 'regioni');
  CREATE TYPE "public"."enum_pages_blocks_numeri_evidenza_sfondo" AS ENUM('scuro', 'chiaro', 'tenue');
  CREATE TYPE "public"."enum_pages_blocks_carosello_schede_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_carosello_sfondo" AS ENUM('scuro', 'chiaro', 'tenue');
  CREATE TYPE "public"."enum_prod_scorr_sfondo" AS ENUM('scuro', 'chiaro', 'tenue');
  CREATE TYPE "public"."enum_prod_scorr_tipo" AS ENUM('immagini', 'video');
  CREATE TYPE "public"."enum_pages_blocks_barra_prodotto_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_numeri_evidenza_voci_tipo" AS ENUM('manuale', 'centri', 'regioni');
  CREATE TYPE "public"."enum__pages_v_blocks_numeri_evidenza_sfondo" AS ENUM('scuro', 'chiaro', 'tenue');
  CREATE TYPE "public"."enum__pages_v_blocks_carosello_schede_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_carosello_sfondo" AS ENUM('scuro', 'chiaro', 'tenue');
  CREATE TYPE "public"."enum__prod_scorr_v_sfondo" AS ENUM('scuro', 'chiaro', 'tenue');
  CREATE TYPE "public"."enum__prod_scorr_v_tipo" AS ENUM('immagini', 'video');
  CREATE TYPE "public"."enum__pages_v_blocks_barra_prodotto_link_type" AS ENUM('reference', 'custom');
  CREATE TABLE "pages_blocks_numeri_evidenza_voci" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tipo" "enum_pages_blocks_numeri_evidenza_voci_tipo" DEFAULT 'manuale',
  	"valore" numeric,
  	"conta" boolean DEFAULT true,
  	"prefisso" varchar,
  	"suffisso" varchar,
  	"etichetta" varchar
  );
  
  CREATE TABLE "pages_blocks_numeri_evidenza" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"titolo" varchar,
  	"sfondo" "enum_pages_blocks_numeri_evidenza_sfondo" DEFAULT 'scuro',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_carosello_schede" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"immagine_id" integer,
  	"occhiello" varchar,
  	"titolo" varchar,
  	"testo" varchar,
  	"con_link" boolean DEFAULT false,
  	"link_type" "enum_pages_blocks_carosello_schede_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar
  );
  
  CREATE TABLE "pages_blocks_carosello" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"titolo" varchar,
  	"sfondo" "enum_pages_blocks_carosello_sfondo" DEFAULT 'tenue',
  	"block_name" varchar
  );
  
  CREATE TABLE "prod_scorr_pass" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"immagine_id" integer,
  	"occhiello" varchar,
  	"titolo" varchar,
  	"testo" varchar
  );
  
  CREATE TABLE "prod_scorr" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"occhiello" varchar,
  	"titolo" varchar,
  	"sfondo" "enum_prod_scorr_sfondo" DEFAULT 'scuro',
  	"tipo" "enum_prod_scorr_tipo" DEFAULT 'immagini',
  	"video_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_barra_prodotto" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"nome" varchar,
  	"sottotitolo" varchar,
  	"link_type" "enum_pages_blocks_barra_prodotto_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_numeri_evidenza_voci" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"tipo" "enum__pages_v_blocks_numeri_evidenza_voci_tipo" DEFAULT 'manuale',
  	"valore" numeric,
  	"conta" boolean DEFAULT true,
  	"prefisso" varchar,
  	"suffisso" varchar,
  	"etichetta" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_numeri_evidenza" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"titolo" varchar,
  	"sfondo" "enum__pages_v_blocks_numeri_evidenza_sfondo" DEFAULT 'scuro',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_carosello_schede" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"immagine_id" integer,
  	"occhiello" varchar,
  	"titolo" varchar,
  	"testo" varchar,
  	"con_link" boolean DEFAULT false,
  	"link_type" "enum__pages_v_blocks_carosello_schede_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_carosello" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"titolo" varchar,
  	"sfondo" "enum__pages_v_blocks_carosello_sfondo" DEFAULT 'tenue',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_prod_scorr_pass_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"immagine_id" integer,
  	"occhiello" varchar,
  	"titolo" varchar,
  	"testo" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_prod_scorr_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"occhiello" varchar,
  	"titolo" varchar,
  	"sfondo" "enum__prod_scorr_v_sfondo" DEFAULT 'scuro',
  	"tipo" "enum__prod_scorr_v_tipo" DEFAULT 'immagini',
  	"video_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_barra_prodotto" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"nome" varchar,
  	"sottotitolo" varchar,
  	"link_type" "enum__pages_v_blocks_barra_prodotto_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_numeri_evidenza_voci" ADD CONSTRAINT "pages_blocks_numeri_evidenza_voci_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_numeri_evidenza"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_numeri_evidenza" ADD CONSTRAINT "pages_blocks_numeri_evidenza_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_carosello_schede" ADD CONSTRAINT "pages_blocks_carosello_schede_immagine_id_media_id_fk" FOREIGN KEY ("immagine_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_carosello_schede" ADD CONSTRAINT "pages_blocks_carosello_schede_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_carosello"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_carosello" ADD CONSTRAINT "pages_blocks_carosello_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "prod_scorr_pass" ADD CONSTRAINT "prod_scorr_pass_immagine_id_media_id_fk" FOREIGN KEY ("immagine_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "prod_scorr_pass" ADD CONSTRAINT "prod_scorr_pass_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."prod_scorr"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "prod_scorr" ADD CONSTRAINT "prod_scorr_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "prod_scorr" ADD CONSTRAINT "prod_scorr_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_barra_prodotto" ADD CONSTRAINT "pages_blocks_barra_prodotto_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_numeri_evidenza_voci" ADD CONSTRAINT "_pages_v_blocks_numeri_evidenza_voci_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_numeri_evidenza"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_numeri_evidenza" ADD CONSTRAINT "_pages_v_blocks_numeri_evidenza_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_carosello_schede" ADD CONSTRAINT "_pages_v_blocks_carosello_schede_immagine_id_media_id_fk" FOREIGN KEY ("immagine_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_carosello_schede" ADD CONSTRAINT "_pages_v_blocks_carosello_schede_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_carosello"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_carosello" ADD CONSTRAINT "_pages_v_blocks_carosello_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_prod_scorr_pass_v" ADD CONSTRAINT "_prod_scorr_pass_v_immagine_id_media_id_fk" FOREIGN KEY ("immagine_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_prod_scorr_pass_v" ADD CONSTRAINT "_prod_scorr_pass_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_prod_scorr_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_prod_scorr_v" ADD CONSTRAINT "_prod_scorr_v_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_prod_scorr_v" ADD CONSTRAINT "_prod_scorr_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_barra_prodotto" ADD CONSTRAINT "_pages_v_blocks_barra_prodotto_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_numeri_evidenza_voci_order_idx" ON "pages_blocks_numeri_evidenza_voci" USING btree ("_order");
  CREATE INDEX "pages_blocks_numeri_evidenza_voci_parent_id_idx" ON "pages_blocks_numeri_evidenza_voci" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_numeri_evidenza_order_idx" ON "pages_blocks_numeri_evidenza" USING btree ("_order");
  CREATE INDEX "pages_blocks_numeri_evidenza_parent_id_idx" ON "pages_blocks_numeri_evidenza" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_numeri_evidenza_path_idx" ON "pages_blocks_numeri_evidenza" USING btree ("_path");
  CREATE INDEX "pages_blocks_carosello_schede_order_idx" ON "pages_blocks_carosello_schede" USING btree ("_order");
  CREATE INDEX "pages_blocks_carosello_schede_parent_id_idx" ON "pages_blocks_carosello_schede" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_carosello_schede_immagine_idx" ON "pages_blocks_carosello_schede" USING btree ("immagine_id");
  CREATE INDEX "pages_blocks_carosello_order_idx" ON "pages_blocks_carosello" USING btree ("_order");
  CREATE INDEX "pages_blocks_carosello_parent_id_idx" ON "pages_blocks_carosello" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_carosello_path_idx" ON "pages_blocks_carosello" USING btree ("_path");
  CREATE INDEX "prod_scorr_pass_order_idx" ON "prod_scorr_pass" USING btree ("_order");
  CREATE INDEX "prod_scorr_pass_parent_id_idx" ON "prod_scorr_pass" USING btree ("_parent_id");
  CREATE INDEX "prod_scorr_pass_immagine_idx" ON "prod_scorr_pass" USING btree ("immagine_id");
  CREATE INDEX "prod_scorr_order_idx" ON "prod_scorr" USING btree ("_order");
  CREATE INDEX "prod_scorr_parent_id_idx" ON "prod_scorr" USING btree ("_parent_id");
  CREATE INDEX "prod_scorr_path_idx" ON "prod_scorr" USING btree ("_path");
  CREATE INDEX "prod_scorr_video_idx" ON "prod_scorr" USING btree ("video_id");
  CREATE INDEX "pages_blocks_barra_prodotto_order_idx" ON "pages_blocks_barra_prodotto" USING btree ("_order");
  CREATE INDEX "pages_blocks_barra_prodotto_parent_id_idx" ON "pages_blocks_barra_prodotto" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_barra_prodotto_path_idx" ON "pages_blocks_barra_prodotto" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_numeri_evidenza_voci_order_idx" ON "_pages_v_blocks_numeri_evidenza_voci" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_numeri_evidenza_voci_parent_id_idx" ON "_pages_v_blocks_numeri_evidenza_voci" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_numeri_evidenza_order_idx" ON "_pages_v_blocks_numeri_evidenza" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_numeri_evidenza_parent_id_idx" ON "_pages_v_blocks_numeri_evidenza" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_numeri_evidenza_path_idx" ON "_pages_v_blocks_numeri_evidenza" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_carosello_schede_order_idx" ON "_pages_v_blocks_carosello_schede" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_carosello_schede_parent_id_idx" ON "_pages_v_blocks_carosello_schede" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_carosello_schede_immagine_idx" ON "_pages_v_blocks_carosello_schede" USING btree ("immagine_id");
  CREATE INDEX "_pages_v_blocks_carosello_order_idx" ON "_pages_v_blocks_carosello" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_carosello_parent_id_idx" ON "_pages_v_blocks_carosello" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_carosello_path_idx" ON "_pages_v_blocks_carosello" USING btree ("_path");
  CREATE INDEX "_prod_scorr_pass_v_order_idx" ON "_prod_scorr_pass_v" USING btree ("_order");
  CREATE INDEX "_prod_scorr_pass_v_parent_id_idx" ON "_prod_scorr_pass_v" USING btree ("_parent_id");
  CREATE INDEX "_prod_scorr_pass_v_immagine_idx" ON "_prod_scorr_pass_v" USING btree ("immagine_id");
  CREATE INDEX "_prod_scorr_v_order_idx" ON "_prod_scorr_v" USING btree ("_order");
  CREATE INDEX "_prod_scorr_v_parent_id_idx" ON "_prod_scorr_v" USING btree ("_parent_id");
  CREATE INDEX "_prod_scorr_v_path_idx" ON "_prod_scorr_v" USING btree ("_path");
  CREATE INDEX "_prod_scorr_v_video_idx" ON "_prod_scorr_v" USING btree ("video_id");
  CREATE INDEX "_pages_v_blocks_barra_prodotto_order_idx" ON "_pages_v_blocks_barra_prodotto" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_barra_prodotto_parent_id_idx" ON "_pages_v_blocks_barra_prodotto" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_barra_prodotto_path_idx" ON "_pages_v_blocks_barra_prodotto" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_numeri_evidenza_voci" CASCADE;
  DROP TABLE "pages_blocks_numeri_evidenza" CASCADE;
  DROP TABLE "pages_blocks_carosello_schede" CASCADE;
  DROP TABLE "pages_blocks_carosello" CASCADE;
  DROP TABLE "prod_scorr_pass" CASCADE;
  DROP TABLE "prod_scorr" CASCADE;
  DROP TABLE "pages_blocks_barra_prodotto" CASCADE;
  DROP TABLE "_pages_v_blocks_numeri_evidenza_voci" CASCADE;
  DROP TABLE "_pages_v_blocks_numeri_evidenza" CASCADE;
  DROP TABLE "_pages_v_blocks_carosello_schede" CASCADE;
  DROP TABLE "_pages_v_blocks_carosello" CASCADE;
  DROP TABLE "_prod_scorr_pass_v" CASCADE;
  DROP TABLE "_prod_scorr_v" CASCADE;
  DROP TABLE "_pages_v_blocks_barra_prodotto" CASCADE;
  DROP TYPE "public"."enum_pages_blocks_numeri_evidenza_voci_tipo";
  DROP TYPE "public"."enum_pages_blocks_numeri_evidenza_sfondo";
  DROP TYPE "public"."enum_pages_blocks_carosello_schede_link_type";
  DROP TYPE "public"."enum_pages_blocks_carosello_sfondo";
  DROP TYPE "public"."enum_prod_scorr_sfondo";
  DROP TYPE "public"."enum_prod_scorr_tipo";
  DROP TYPE "public"."enum_pages_blocks_barra_prodotto_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_numeri_evidenza_voci_tipo";
  DROP TYPE "public"."enum__pages_v_blocks_numeri_evidenza_sfondo";
  DROP TYPE "public"."enum__pages_v_blocks_carosello_schede_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_carosello_sfondo";
  DROP TYPE "public"."enum__prod_scorr_v_sfondo";
  DROP TYPE "public"."enum__prod_scorr_v_tipo";
  DROP TYPE "public"."enum__pages_v_blocks_barra_prodotto_link_type";`)
}
