import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_schede_sfondo" AS ENUM('scuro', 'chiaro', 'tenue');
  CREATE TYPE "public"."enum_pages_blocks_schede_colonne" AS ENUM('2', '3');
  CREATE TYPE "public"."enum__pages_v_blocks_schede_sfondo" AS ENUM('scuro', 'chiaro', 'tenue');
  CREATE TYPE "public"."enum__pages_v_blocks_schede_colonne" AS ENUM('2', '3');
  CREATE TABLE "pages_blocks_schede_schede" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"occhiello" varchar,
  	"titolo" varchar,
  	"rich_text" jsonb,
  	"immagine_id" integer
  );
  
  CREATE TABLE "pages_blocks_schede" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"occhiello" varchar,
  	"titolo" varchar,
  	"sfondo" "enum_pages_blocks_schede_sfondo" DEFAULT 'chiaro',
  	"colonne" "enum_pages_blocks_schede_colonne" DEFAULT '3',
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_schede_schede" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"occhiello" varchar,
  	"titolo" varchar,
  	"rich_text" jsonb,
  	"immagine_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_schede" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"occhiello" varchar,
  	"titolo" varchar,
  	"sfondo" "enum__pages_v_blocks_schede_sfondo" DEFAULT 'chiaro',
  	"colonne" "enum__pages_v_blocks_schede_colonne" DEFAULT '3',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages" ADD COLUMN "hero_occhiello" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_occhiello" varchar;
  ALTER TABLE "pages_blocks_schede_schede" ADD CONSTRAINT "pages_blocks_schede_schede_immagine_id_media_id_fk" FOREIGN KEY ("immagine_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_schede_schede" ADD CONSTRAINT "pages_blocks_schede_schede_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_schede"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_schede" ADD CONSTRAINT "pages_blocks_schede_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_schede_schede" ADD CONSTRAINT "_pages_v_blocks_schede_schede_immagine_id_media_id_fk" FOREIGN KEY ("immagine_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_schede_schede" ADD CONSTRAINT "_pages_v_blocks_schede_schede_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_schede"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_schede" ADD CONSTRAINT "_pages_v_blocks_schede_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_schede_schede_order_idx" ON "pages_blocks_schede_schede" USING btree ("_order");
  CREATE INDEX "pages_blocks_schede_schede_parent_id_idx" ON "pages_blocks_schede_schede" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_schede_schede_immagine_idx" ON "pages_blocks_schede_schede" USING btree ("immagine_id");
  CREATE INDEX "pages_blocks_schede_order_idx" ON "pages_blocks_schede" USING btree ("_order");
  CREATE INDEX "pages_blocks_schede_parent_id_idx" ON "pages_blocks_schede" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_schede_path_idx" ON "pages_blocks_schede" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_schede_schede_order_idx" ON "_pages_v_blocks_schede_schede" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_schede_schede_parent_id_idx" ON "_pages_v_blocks_schede_schede" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_schede_schede_immagine_idx" ON "_pages_v_blocks_schede_schede" USING btree ("immagine_id");
  CREATE INDEX "_pages_v_blocks_schede_order_idx" ON "_pages_v_blocks_schede" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_schede_parent_id_idx" ON "_pages_v_blocks_schede" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_schede_path_idx" ON "_pages_v_blocks_schede" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_schede_schede" CASCADE;
  DROP TABLE "pages_blocks_schede" CASCADE;
  DROP TABLE "_pages_v_blocks_schede_schede" CASCADE;
  DROP TABLE "_pages_v_blocks_schede" CASCADE;
  ALTER TABLE "pages" DROP COLUMN "hero_occhiello";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_occhiello";
  DROP TYPE "public"."enum_pages_blocks_schede_sfondo";
  DROP TYPE "public"."enum_pages_blocks_schede_colonne";
  DROP TYPE "public"."enum__pages_v_blocks_schede_sfondo";
  DROP TYPE "public"."enum__pages_v_blocks_schede_colonne";`)
}
