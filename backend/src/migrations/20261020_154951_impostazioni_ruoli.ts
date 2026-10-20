import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_ruolo" AS ENUM('amministratore', 'redattore');
  CREATE TYPE "public"."enum_impostazioni_social_piattaforma" AS ENUM('facebook', 'instagram', 'linkedin', 'youtube', 'x', 'tiktok', 'whatsapp', 'threads', 'telegram', 'pinterest');
  CREATE TYPE "public"."enum_impostazioni_analisi_modalita_consenso" AS ENUM('base', 'avanzata');
  CREATE TYPE "public"."enum_impostazioni_avviso_stile" AS ENUM('informazione', 'importante', 'promozione');
  CREATE TYPE "public"."enum_impostazioni_avviso_link_type" AS ENUM('reference', 'custom');
  CREATE TABLE "impostazioni_social" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"piattaforma" "enum_impostazioni_social_piattaforma" NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "impostazioni" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nome_sito" varchar DEFAULT 'Sorazon' NOT NULL,
  	"descrizione_sito" varchar,
  	"analisi_modalita_consenso" "enum_impostazioni_analisi_modalita_consenso" DEFAULT 'base' NOT NULL,
  	"analisi_google_tag_manager_id" varchar,
  	"analisi_google_analytics_id" varchar,
  	"analisi_google_ads_id" varchar,
  	"avviso_attivo" boolean DEFAULT false,
  	"avviso_chiudibile" boolean DEFAULT true,
  	"avviso_testo" varchar,
  	"avviso_stile" "enum_impostazioni_avviso_stile" DEFAULT 'informazione',
  	"avviso_inizio" timestamp(3) with time zone,
  	"avviso_fine" timestamp(3) with time zone,
  	"avviso_con_link" boolean DEFAULT false,
  	"avviso_link_type" "enum_impostazioni_avviso_link_type" DEFAULT 'reference',
  	"avviso_link_new_tab" boolean,
  	"avviso_link_url" varchar,
  	"avviso_link_label" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "impostazioni_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer
  );
  
  ALTER TABLE "users" ADD COLUMN "ruolo" "enum_users_ruolo" DEFAULT 'redattore' NOT NULL;
  ALTER TABLE "impostazioni_social" ADD CONSTRAINT "impostazioni_social_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."impostazioni"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "impostazioni_rels" ADD CONSTRAINT "impostazioni_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."impostazioni"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "impostazioni_rels" ADD CONSTRAINT "impostazioni_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "impostazioni_rels" ADD CONSTRAINT "impostazioni_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "impostazioni_social_order_idx" ON "impostazioni_social" USING btree ("_order");
  CREATE INDEX "impostazioni_social_parent_id_idx" ON "impostazioni_social" USING btree ("_parent_id");
  CREATE INDEX "impostazioni_rels_order_idx" ON "impostazioni_rels" USING btree ("order");
  CREATE INDEX "impostazioni_rels_parent_idx" ON "impostazioni_rels" USING btree ("parent_id");
  CREATE INDEX "impostazioni_rels_path_idx" ON "impostazioni_rels" USING btree ("path");
  CREATE INDEX "impostazioni_rels_pages_id_idx" ON "impostazioni_rels" USING btree ("pages_id");
  CREATE INDEX "impostazioni_rels_posts_id_idx" ON "impostazioni_rels" USING btree ("posts_id");
  -- Gli utenti che esistevano prima dei ruoli restano amministratori (nessuno perde l'accesso)
  UPDATE "users" SET "ruolo" = 'amministratore';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "impostazioni_social" CASCADE;
  DROP TABLE "impostazioni" CASCADE;
  DROP TABLE "impostazioni_rels" CASCADE;
  ALTER TABLE "users" DROP COLUMN "ruolo";
  DROP TYPE "public"."enum_users_ruolo";
  DROP TYPE "public"."enum_impostazioni_social_piattaforma";
  DROP TYPE "public"."enum_impostazioni_analisi_modalita_consenso";
  DROP TYPE "public"."enum_impostazioni_avviso_stile";
  DROP TYPE "public"."enum_impostazioni_avviso_link_type";`)
}
