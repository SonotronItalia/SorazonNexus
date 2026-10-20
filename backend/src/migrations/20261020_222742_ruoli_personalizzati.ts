import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "ruoli" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nome" varchar NOT NULL,
  	"descrizione" varchar,
  	"completo" boolean DEFAULT false,
  	"permessi_pages_vede" boolean DEFAULT false,
  	"permessi_pages_crea" boolean DEFAULT false,
  	"permessi_pages_modifica" boolean DEFAULT false,
  	"permessi_pages_elimina" boolean DEFAULT false,
  	"permessi_posts_vede" boolean DEFAULT false,
  	"permessi_posts_crea" boolean DEFAULT false,
  	"permessi_posts_modifica" boolean DEFAULT false,
  	"permessi_posts_elimina" boolean DEFAULT false,
  	"permessi_centri_vede" boolean DEFAULT false,
  	"permessi_centri_crea" boolean DEFAULT false,
  	"permessi_centri_modifica" boolean DEFAULT false,
  	"permessi_centri_elimina" boolean DEFAULT false,
  	"permessi_media_vede" boolean DEFAULT false,
  	"permessi_media_crea" boolean DEFAULT false,
  	"permessi_media_modifica" boolean DEFAULT false,
  	"permessi_media_elimina" boolean DEFAULT false,
  	"permessi_forms_vede" boolean DEFAULT false,
  	"permessi_forms_crea" boolean DEFAULT false,
  	"permessi_forms_modifica" boolean DEFAULT false,
  	"permessi_forms_elimina" boolean DEFAULT false,
  	"permessi_form_submissions_vede" boolean DEFAULT false,
  	"permessi_form_submissions_elimina" boolean DEFAULT false,
  	"permessi_colori_vede" boolean DEFAULT false,
  	"permessi_colori_crea" boolean DEFAULT false,
  	"permessi_colori_modifica" boolean DEFAULT false,
  	"permessi_colori_elimina" boolean DEFAULT false,
  	"permessi_effetti_vede" boolean DEFAULT false,
  	"permessi_effetti_crea" boolean DEFAULT false,
  	"permessi_effetti_modifica" boolean DEFAULT false,
  	"permessi_effetti_elimina" boolean DEFAULT false,
  	"permessi_torna_su_vede" boolean DEFAULT false,
  	"permessi_torna_su_modifica" boolean DEFAULT false,
  	"permessi_impostazioni_vede" boolean DEFAULT false,
  	"permessi_impostazioni_modifica" boolean DEFAULT false,
  	"permessi_impostazioni_analisi_modifica" boolean DEFAULT false,
  	"permessi_header_vede" boolean DEFAULT false,
  	"permessi_header_modifica" boolean DEFAULT false,
  	"permessi_footer_vede" boolean DEFAULT false,
  	"permessi_footer_modifica" boolean DEFAULT false,
  	"permessi_categories_vede" boolean DEFAULT false,
  	"permessi_categories_crea" boolean DEFAULT false,
  	"permessi_categories_modifica" boolean DEFAULT false,
  	"permessi_categories_elimina" boolean DEFAULT false,
  	"permessi_tipi_effetto_vede" boolean DEFAULT false,
  	"permessi_tipi_effetto_crea" boolean DEFAULT false,
  	"permessi_tipi_effetto_modifica" boolean DEFAULT false,
  	"permessi_tipi_effetto_elimina" boolean DEFAULT false,
  	"permessi_redirects_vede" boolean DEFAULT false,
  	"permessi_redirects_crea" boolean DEFAULT false,
  	"permessi_redirects_modifica" boolean DEFAULT false,
  	"permessi_redirects_elimina" boolean DEFAULT false,
  	"permessi_search_vede" boolean DEFAULT false,
  	"permessi_search_crea" boolean DEFAULT false,
  	"permessi_search_modifica" boolean DEFAULT false,
  	"permessi_search_elimina" boolean DEFAULT false,
  	"permessi_users_vede" boolean DEFAULT false,
  	"permessi_users_crea" boolean DEFAULT false,
  	"permessi_users_modifica" boolean DEFAULT false,
  	"permessi_users_elimina" boolean DEFAULT false,
  	"permessi_ruoli_vede" boolean DEFAULT false,
  	"permessi_ruoli_crea" boolean DEFAULT false,
  	"permessi_ruoli_modifica" boolean DEFAULT false,
  	"permessi_ruoli_elimina" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "users" ALTER COLUMN "ruolo" DROP DEFAULT;
  ALTER TABLE "users" ALTER COLUMN "ruolo" DROP NOT NULL;
  ALTER TABLE "users" ADD COLUMN "profilo_id" integer;
  -- I due ruoli di prima diventano ruoli modificabili: Amministratore (tutto) e Redattore
  INSERT INTO "ruoli" ("nome", "descrizione", "completo") VALUES
    ('Amministratore', 'Vede e modifica tutto, compresi utenti e ruoli.', true);
  INSERT INTO "ruoli" ("nome", "descrizione", "completo", "permessi_pages_vede", "permessi_pages_crea", "permessi_pages_modifica", "permessi_pages_elimina", "permessi_posts_vede", "permessi_posts_crea", "permessi_posts_modifica", "permessi_posts_elimina", "permessi_centri_vede", "permessi_centri_crea", "permessi_centri_modifica", "permessi_centri_elimina", "permessi_media_vede", "permessi_media_crea", "permessi_media_modifica", "permessi_media_elimina", "permessi_forms_vede", "permessi_forms_crea", "permessi_forms_modifica", "permessi_forms_elimina", "permessi_form_submissions_vede", "permessi_form_submissions_elimina", "permessi_colori_vede", "permessi_colori_crea", "permessi_colori_modifica", "permessi_colori_elimina", "permessi_effetti_vede", "permessi_effetti_crea", "permessi_effetti_modifica", "permessi_effetti_elimina", "permessi_torna_su_vede", "permessi_torna_su_modifica", "permessi_impostazioni_vede", "permessi_impostazioni_modifica", "permessi_header_vede", "permessi_header_modifica", "permessi_footer_vede", "permessi_footer_modifica") VALUES
    ('Redattore', 'Contenuti, contatti, aspetto del sito e impostazioni generali.', false, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true);
  UPDATE "users" SET "profilo_id" = (SELECT "id" FROM "ruoli" WHERE "nome" =
    CASE WHEN "users"."ruolo" = 'amministratore' THEN 'Amministratore' ELSE 'Redattore' END);
  ALTER TABLE "users" ALTER COLUMN "profilo_id" SET NOT NULL;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "ruoli_id" integer;
  CREATE UNIQUE INDEX "ruoli_nome_idx" ON "ruoli" USING btree ("nome");
  CREATE INDEX "ruoli_updated_at_idx" ON "ruoli" USING btree ("updated_at");
  CREATE INDEX "ruoli_created_at_idx" ON "ruoli" USING btree ("created_at");
  ALTER TABLE "users" ADD CONSTRAINT "users_profilo_id_ruoli_id_fk" FOREIGN KEY ("profilo_id") REFERENCES "public"."ruoli"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_ruoli_fk" FOREIGN KEY ("ruoli_id") REFERENCES "public"."ruoli"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_profilo_idx" ON "users" USING btree ("profilo_id");
  CREATE INDEX "payload_locked_documents_rels_ruoli_id_idx" ON "payload_locked_documents_rels" USING btree ("ruoli_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "ruoli" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "ruoli" CASCADE;
  ALTER TABLE "users" DROP CONSTRAINT "users_profilo_id_ruoli_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_ruoli_fk";
  
  DROP INDEX "users_profilo_idx";
  DROP INDEX "payload_locked_documents_rels_ruoli_id_idx";
  ALTER TABLE "users" ALTER COLUMN "ruolo" SET DEFAULT 'redattore';
  ALTER TABLE "users" ALTER COLUMN "ruolo" SET NOT NULL;
  ALTER TABLE "users" DROP COLUMN "profilo_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "ruoli_id";`)
}
