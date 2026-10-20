import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   -- I profili social passano dal Piè di pagina alle Impostazioni del sito: prima si copiano
  -- (creando la riga delle Impostazioni se non c'è), poi si toglie la vecchia tabella
  INSERT INTO "impostazioni" ("updated_at", "created_at")
    SELECT now(), now() WHERE NOT EXISTS (SELECT 1 FROM "impostazioni");
  INSERT INTO "impostazioni_social" ("_order", "_parent_id", "id", "piattaforma", "url")
    SELECT fs."_order", (SELECT min("id") FROM "impostazioni"), fs."id",
           fs."piattaforma"::text::"enum_impostazioni_social_piattaforma", fs."url"
    FROM "footer_social" fs
    ON CONFLICT ("id") DO NOTHING;
  DROP TABLE "footer_social" CASCADE;
  DROP TYPE "public"."enum_footer_social_piattaforma";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_footer_social_piattaforma" AS ENUM('facebook', 'instagram', 'linkedin', 'youtube', 'x', 'tiktok', 'whatsapp', 'threads', 'telegram', 'pinterest');
  CREATE TABLE "footer_social" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"piattaforma" "enum_footer_social_piattaforma" NOT NULL,
  	"url" varchar NOT NULL
  );
  
  ALTER TABLE "footer_social" ADD CONSTRAINT "footer_social_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "footer_social_order_idx" ON "footer_social" USING btree ("_order");
  CREATE INDEX "footer_social_parent_id_idx" ON "footer_social" USING btree ("_parent_id");
  -- Ritorno indietro: i social tornano nel Piè di pagina
  INSERT INTO "footer_social" ("_order", "_parent_id", "id", "piattaforma", "url")
    SELECT s."_order", (SELECT min("id") FROM "footer"), s."id",
           s."piattaforma"::text::"enum_footer_social_piattaforma", s."url"
    FROM "impostazioni_social" s
    WHERE EXISTS (SELECT 1 FROM "footer")
    ON CONFLICT ("id") DO NOTHING;`)
}
