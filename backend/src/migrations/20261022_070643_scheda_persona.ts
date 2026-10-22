import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_scheda_persona_posizione_foto" AS ENUM('sinistra', 'destra');
  CREATE TYPE "public"."enum_pages_blocks_scheda_persona_sfondo" AS ENUM('nessuno', 'scuro', 'chiaro', 'tenue');
  CREATE TYPE "public"."enum__pages_v_blocks_scheda_persona_posizione_foto" AS ENUM('sinistra', 'destra');
  CREATE TYPE "public"."enum__pages_v_blocks_scheda_persona_sfondo" AS ENUM('nessuno', 'scuro', 'chiaro', 'tenue');
  CREATE TABLE "pages_blocks_scheda_persona" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"ruolo" varchar,
  	"nome" varchar,
  	"rich_text" jsonb,
  	"foto_id" integer,
  	"posizione_foto" "enum_pages_blocks_scheda_persona_posizione_foto" DEFAULT 'sinistra',
  	"sfondo" "enum_pages_blocks_scheda_persona_sfondo" DEFAULT 'nessuno',
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_scheda_persona" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"ruolo" varchar,
  	"nome" varchar,
  	"rich_text" jsonb,
  	"foto_id" integer,
  	"posizione_foto" "enum__pages_v_blocks_scheda_persona_posizione_foto" DEFAULT 'sinistra',
  	"sfondo" "enum__pages_v_blocks_scheda_persona_sfondo" DEFAULT 'nessuno',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_scheda_persona" ADD CONSTRAINT "pages_blocks_scheda_persona_foto_id_media_id_fk" FOREIGN KEY ("foto_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_scheda_persona" ADD CONSTRAINT "pages_blocks_scheda_persona_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_scheda_persona" ADD CONSTRAINT "_pages_v_blocks_scheda_persona_foto_id_media_id_fk" FOREIGN KEY ("foto_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_scheda_persona" ADD CONSTRAINT "_pages_v_blocks_scheda_persona_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_scheda_persona_order_idx" ON "pages_blocks_scheda_persona" USING btree ("_order");
  CREATE INDEX "pages_blocks_scheda_persona_parent_id_idx" ON "pages_blocks_scheda_persona" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_scheda_persona_path_idx" ON "pages_blocks_scheda_persona" USING btree ("_path");
  CREATE INDEX "pages_blocks_scheda_persona_locale_idx" ON "pages_blocks_scheda_persona" USING btree ("_locale");
  CREATE INDEX "pages_blocks_scheda_persona_foto_idx" ON "pages_blocks_scheda_persona" USING btree ("foto_id");
  CREATE INDEX "_pages_v_blocks_scheda_persona_order_idx" ON "_pages_v_blocks_scheda_persona" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_scheda_persona_parent_id_idx" ON "_pages_v_blocks_scheda_persona" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_scheda_persona_path_idx" ON "_pages_v_blocks_scheda_persona" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_scheda_persona_locale_idx" ON "_pages_v_blocks_scheda_persona" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_scheda_persona_foto_idx" ON "_pages_v_blocks_scheda_persona" USING btree ("foto_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_scheda_persona" CASCADE;
  DROP TABLE "_pages_v_blocks_scheda_persona" CASCADE;
  DROP TYPE "public"."enum_pages_blocks_scheda_persona_posizione_foto";
  DROP TYPE "public"."enum_pages_blocks_scheda_persona_sfondo";
  DROP TYPE "public"."enum__pages_v_blocks_scheda_persona_posizione_foto";
  DROP TYPE "public"."enum__pages_v_blocks_scheda_persona_sfondo";`)
}
