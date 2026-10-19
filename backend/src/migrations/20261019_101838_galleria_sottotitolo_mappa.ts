import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_mappa_altezza" AS ENUM('bassa', 'media', 'alta');
  CREATE TYPE "public"."enum__pages_v_blocks_mappa_altezza" AS ENUM('bassa', 'media', 'alta');
  ALTER TYPE "public"."enum_pages_blocks_galleria_risultati_sfondo" ADD VALUE 'celeste';
  ALTER TYPE "public"."enum__pages_v_blocks_galleria_risultati_sfondo" ADD VALUE 'celeste';
  CREATE TABLE "pages_blocks_mappa" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"titolo" varchar,
  	"indirizzo" varchar,
  	"altezza" "enum_pages_blocks_mappa_altezza" DEFAULT 'media',
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_mappa" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"titolo" varchar,
  	"indirizzo" varchar,
  	"altezza" "enum__pages_v_blocks_mappa_altezza" DEFAULT 'media',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_galleria_risultati_voci" ADD COLUMN "sottotitolo" varchar;
  ALTER TABLE "_pages_v_blocks_galleria_risultati_voci" ADD COLUMN "sottotitolo" varchar;
  ALTER TABLE "pages_blocks_mappa" ADD CONSTRAINT "pages_blocks_mappa_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_mappa" ADD CONSTRAINT "_pages_v_blocks_mappa_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_mappa_order_idx" ON "pages_blocks_mappa" USING btree ("_order");
  CREATE INDEX "pages_blocks_mappa_parent_id_idx" ON "pages_blocks_mappa" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_mappa_path_idx" ON "pages_blocks_mappa" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_mappa_order_idx" ON "_pages_v_blocks_mappa" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_mappa_parent_id_idx" ON "_pages_v_blocks_mappa" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_mappa_path_idx" ON "_pages_v_blocks_mappa" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_mappa" CASCADE;
  DROP TABLE "_pages_v_blocks_mappa" CASCADE;
  ALTER TABLE "pages_blocks_galleria_risultati" ALTER COLUMN "sfondo" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_galleria_risultati" ALTER COLUMN "sfondo" SET DEFAULT 'nessuno'::text;
  DROP TYPE "public"."enum_pages_blocks_galleria_risultati_sfondo";
  CREATE TYPE "public"."enum_pages_blocks_galleria_risultati_sfondo" AS ENUM('nessuno', 'tenue', 'scuro');
  ALTER TABLE "pages_blocks_galleria_risultati" ALTER COLUMN "sfondo" SET DEFAULT 'nessuno'::"public"."enum_pages_blocks_galleria_risultati_sfondo";
  ALTER TABLE "pages_blocks_galleria_risultati" ALTER COLUMN "sfondo" SET DATA TYPE "public"."enum_pages_blocks_galleria_risultati_sfondo" USING "sfondo"::"public"."enum_pages_blocks_galleria_risultati_sfondo";
  ALTER TABLE "_pages_v_blocks_galleria_risultati" ALTER COLUMN "sfondo" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_galleria_risultati" ALTER COLUMN "sfondo" SET DEFAULT 'nessuno'::text;
  DROP TYPE "public"."enum__pages_v_blocks_galleria_risultati_sfondo";
  CREATE TYPE "public"."enum__pages_v_blocks_galleria_risultati_sfondo" AS ENUM('nessuno', 'tenue', 'scuro');
  ALTER TABLE "_pages_v_blocks_galleria_risultati" ALTER COLUMN "sfondo" SET DEFAULT 'nessuno'::"public"."enum__pages_v_blocks_galleria_risultati_sfondo";
  ALTER TABLE "_pages_v_blocks_galleria_risultati" ALTER COLUMN "sfondo" SET DATA TYPE "public"."enum__pages_v_blocks_galleria_risultati_sfondo" USING "sfondo"::"public"."enum__pages_v_blocks_galleria_risultati_sfondo";
  ALTER TABLE "pages_blocks_galleria_risultati_voci" DROP COLUMN "sottotitolo";
  ALTER TABLE "_pages_v_blocks_galleria_risultati_voci" DROP COLUMN "sottotitolo";
  DROP TYPE "public"."enum_pages_blocks_mappa_altezza";
  DROP TYPE "public"."enum__pages_v_blocks_mappa_altezza";`)
}
