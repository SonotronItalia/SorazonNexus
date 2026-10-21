import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "seo_ricerca_escluse" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"percorso" varchar NOT NULL
  );
  
  CREATE TABLE "seo" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nome_sito" varchar DEFAULT 'Sorazon' NOT NULL,
  	"descrizione_sito" varchar,
  	"modello_titolo" varchar DEFAULT '{pagina} | {sito}',
  	"immagine_condivisione_id" integer,
  	"ricerca_nascondi_sito" boolean DEFAULT false,
  	"ricerca_verifica_google" varchar,
  	"ricerca_verifica_bing" varchar,
  	"ai_ammessi_chatgpt" boolean DEFAULT true,
  	"ai_ammessi_claude" boolean DEFAULT true,
  	"ai_ammessi_perplexity" boolean DEFAULT true,
  	"ai_ammessi_gemini" boolean DEFAULT true,
  	"ai_ammessi_apple" boolean DEFAULT true,
  	"ai_ammessi_meta" boolean DEFAULT true,
  	"ai_ammessi_common_crawl" boolean DEFAULT true,
  	"ai_llms_presentazione" varchar,
  	"ai_llms_centri" boolean DEFAULT true,
  	"ai_llms_notizie" boolean DEFAULT true,
  	"azienda_ragione_sociale" varchar,
  	"azienda_logo_id" integer,
  	"azienda_via" varchar,
  	"azienda_cap" varchar,
  	"azienda_citta" varchar,
  	"azienda_provincia" varchar,
  	"azienda_telefono" varchar,
  	"azienda_email" varchar,
  	"azienda_partita_iva" varchar,
  	"azienda_codice_fiscale" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "ruoli" ADD COLUMN "permessi_seo_vede" boolean DEFAULT false;
  ALTER TABLE "ruoli" ADD COLUMN "permessi_seo_modifica" boolean DEFAULT false;
  ALTER TABLE "seo_ricerca_escluse" ADD CONSTRAINT "seo_ricerca_escluse_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."seo"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "seo" ADD CONSTRAINT "seo_immagine_condivisione_id_media_id_fk" FOREIGN KEY ("immagine_condivisione_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "seo" ADD CONSTRAINT "seo_azienda_logo_id_media_id_fk" FOREIGN KEY ("azienda_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "seo_ricerca_escluse_order_idx" ON "seo_ricerca_escluse" USING btree ("_order");
  CREATE INDEX "seo_ricerca_escluse_parent_id_idx" ON "seo_ricerca_escluse" USING btree ("_parent_id");
  CREATE INDEX "seo_immagine_condivisione_idx" ON "seo" USING btree ("immagine_condivisione_id");
  CREATE INDEX "seo_azienda_azienda_logo_idx" ON "seo" USING btree ("azienda_logo_id");
  -- Nome e descrizione dalle Impostazioni, dati dell'azienda dal Piè di pagina
  -- ("Via 44 - 61032 Città (PR)" diviso in via, CAP, città e provincia)
  INSERT INTO "seo" ("nome_sito", "descrizione_sito", "azienda_ragione_sociale", "azienda_via",
    "azienda_cap", "azienda_citta", "azienda_provincia", "azienda_telefono", "azienda_email",
    "azienda_partita_iva", "azienda_codice_fiscale", "updated_at", "created_at")
  SELECT
    COALESCE(NULLIF(TRIM(i."nome_sito"), ''), 'Sorazon'),
    i."descrizione_sito",
    f."dati_legali_ragione_sociale",
    COALESCE(SUBSTRING(f."dati_legali_indirizzo" FROM '^(.*?)\\s*[-,]\\s*\\d{5}\\s'), f."dati_legali_indirizzo"),
    SUBSTRING(f."dati_legali_indirizzo" FROM '(\\d{5})\\s'),
    SUBSTRING(f."dati_legali_indirizzo" FROM '\\d{5}\\s+(.+?)\\s*\\([A-Z]{2}\\)\\s*$'),
    SUBSTRING(f."dati_legali_indirizzo" FROM '\\(([A-Z]{2})\\)\\s*$'),
    f."dati_legali_telefono",
    f."dati_legali_email",
    f."dati_legali_partita_iva",
    f."dati_legali_codice_fiscale",
    now(), now()
  FROM (SELECT 1) AS uno
  LEFT JOIN "impostazioni" i ON true
  LEFT JOIN "footer" f ON true
  LIMIT 1;
  ALTER TABLE "impostazioni" DROP COLUMN "nome_sito";
  ALTER TABLE "impostazioni" DROP COLUMN "descrizione_sito";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "seo_ricerca_escluse" CASCADE;
  DROP TABLE "seo" CASCADE;
  ALTER TABLE "impostazioni" ADD COLUMN "nome_sito" varchar DEFAULT 'Sorazon' NOT NULL;
  ALTER TABLE "impostazioni" ADD COLUMN "descrizione_sito" varchar;
  ALTER TABLE "ruoli" DROP COLUMN "permessi_seo_vede";
  ALTER TABLE "ruoli" DROP COLUMN "permessi_seo_modifica";`)
}
