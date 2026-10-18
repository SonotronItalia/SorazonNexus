import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_galleria_risultati_colonne" AS ENUM('2', '3');
  CREATE TYPE "public"."enum_pages_blocks_galleria_risultati_sfondo" AS ENUM('nessuno', 'tenue', 'scuro');
  CREATE TYPE "public"."enum__pages_v_blocks_galleria_risultati_colonne" AS ENUM('2', '3');
  CREATE TYPE "public"."enum__pages_v_blocks_galleria_risultati_sfondo" AS ENUM('nessuno', 'tenue', 'scuro');
  CREATE TABLE "pages_blocks_galleria_risultati_voci" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"immagine_id" integer,
  	"etichetta" varchar,
  	"descrizione" varchar
  );
  
  CREATE TABLE "pages_blocks_galleria_risultati" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"titolo" varchar,
  	"introduzione" varchar,
  	"colonne" "enum_pages_blocks_galleria_risultati_colonne" DEFAULT '2',
  	"sfondo" "enum_pages_blocks_galleria_risultati_sfondo" DEFAULT 'nessuno',
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_galleria_risultati_voci" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"immagine_id" integer,
  	"etichetta" varchar,
  	"descrizione" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_galleria_risultati" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"titolo" varchar,
  	"introduzione" varchar,
  	"colonne" "enum__pages_v_blocks_galleria_risultati_colonne" DEFAULT '2',
  	"sfondo" "enum__pages_v_blocks_galleria_risultati_sfondo" DEFAULT 'nessuno',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_galleria_risultati_voci" ADD CONSTRAINT "pages_blocks_galleria_risultati_voci_immagine_id_media_id_fk" FOREIGN KEY ("immagine_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_galleria_risultati_voci" ADD CONSTRAINT "pages_blocks_galleria_risultati_voci_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_galleria_risultati"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_galleria_risultati" ADD CONSTRAINT "pages_blocks_galleria_risultati_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_galleria_risultati_voci" ADD CONSTRAINT "_pages_v_blocks_galleria_risultati_voci_immagine_id_media_id_fk" FOREIGN KEY ("immagine_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_galleria_risultati_voci" ADD CONSTRAINT "_pages_v_blocks_galleria_risultati_voci_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_galleria_risultati"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_galleria_risultati" ADD CONSTRAINT "_pages_v_blocks_galleria_risultati_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_galleria_risultati_voci_order_idx" ON "pages_blocks_galleria_risultati_voci" USING btree ("_order");
  CREATE INDEX "pages_blocks_galleria_risultati_voci_parent_id_idx" ON "pages_blocks_galleria_risultati_voci" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_galleria_risultati_voci_immagine_idx" ON "pages_blocks_galleria_risultati_voci" USING btree ("immagine_id");
  CREATE INDEX "pages_blocks_galleria_risultati_order_idx" ON "pages_blocks_galleria_risultati" USING btree ("_order");
  CREATE INDEX "pages_blocks_galleria_risultati_parent_id_idx" ON "pages_blocks_galleria_risultati" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_galleria_risultati_path_idx" ON "pages_blocks_galleria_risultati" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_galleria_risultati_voci_order_idx" ON "_pages_v_blocks_galleria_risultati_voci" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_galleria_risultati_voci_parent_id_idx" ON "_pages_v_blocks_galleria_risultati_voci" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_galleria_risultati_voci_immagine_idx" ON "_pages_v_blocks_galleria_risultati_voci" USING btree ("immagine_id");
  CREATE INDEX "_pages_v_blocks_galleria_risultati_order_idx" ON "_pages_v_blocks_galleria_risultati" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_galleria_risultati_parent_id_idx" ON "_pages_v_blocks_galleria_risultati" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_galleria_risultati_path_idx" ON "_pages_v_blocks_galleria_risultati" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_galleria_risultati_voci" CASCADE;
  DROP TABLE "pages_blocks_galleria_risultati" CASCADE;
  DROP TABLE "_pages_v_blocks_galleria_risultati_voci" CASCADE;
  DROP TABLE "_pages_v_blocks_galleria_risultati" CASCADE;
  DROP TYPE "public"."enum_pages_blocks_galleria_risultati_colonne";
  DROP TYPE "public"."enum_pages_blocks_galleria_risultati_sfondo";
  DROP TYPE "public"."enum__pages_v_blocks_galleria_risultati_colonne";
  DROP TYPE "public"."enum__pages_v_blocks_galleria_risultati_sfondo";`)
}
