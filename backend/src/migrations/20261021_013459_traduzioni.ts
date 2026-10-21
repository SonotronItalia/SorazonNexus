import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('it', 'en', 'de', 'fr', 'es', 'pt', 'nl', 'pl', 'ro', 'cs', 'el', 'sv');
  CREATE TYPE "public"."enum__pages_v_published_locale" AS ENUM('it', 'en', 'de', 'fr', 'es', 'pt', 'nl', 'pl', 'ro', 'cs', 'el', 'sv');
  CREATE TYPE "public"."enum__posts_v_published_locale" AS ENUM('it', 'en', 'de', 'fr', 'es', 'pt', 'nl', 'pl', 'ro', 'cs', 'el', 'sv');
  CREATE TYPE "public"."enum_lingue_el_codice" AS ENUM('en', 'de', 'fr', 'es', 'pt', 'nl', 'pl', 'ro', 'cs', 'el', 'sv');
  CREATE TYPE "public"."enum_lingue_el_bandiera" AS ENUM('it', 'ch', 'gb', 'us', 'ie', 'de', 'at', 'fr', 'be', 'es', 'mx', 'ar', 'pt', 'br', 'nl', 'pl', 'ro', 'md', 'cz', 'gr', 'cy', 'se', 'fi');
  CREATE TYPE "public"."enum_lingue_stile" AS ENUM('bandiera-nome', 'bandiera-sigla', 'bandiera');
  CREATE TABLE "pages_locales" (
  	"title" varchar,
  	"hero_type" "enum_pages_hero_type" DEFAULT 'lowImpact',
  	"hero_occhiello" varchar,
  	"hero_rich_text" jsonb,
  	"hero_media_id" integer,
  	"hero_bordo_immagine" boolean DEFAULT true,
  	"hero_sfondo_media" "enum_pages_hero_sfondo_media" DEFAULT 'immagine',
  	"hero_posizione_titolo" "enum_pages_hero_posizione_titolo",
  	"hero_proporzione" "enum_pages_hero_proporzione",
  	"hero_video_sorgente" "enum_pages_hero_video_sorgente" DEFAULT 'file',
  	"hero_video_file_id" integer,
  	"hero_video_url" varchar,
  	"hero_overlay" "enum_pages_hero_overlay" DEFAULT 'nessuna',
  	"hero_colore_overlay_id" integer,
  	"meta_title" varchar,
  	"meta_image_id" integer,
  	"meta_description" varchar,
  	"in_lingua" boolean DEFAULT false,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_locales" (
  	"version_title" varchar,
  	"version_hero_type" "enum__pages_v_version_hero_type" DEFAULT 'lowImpact',
  	"version_hero_occhiello" varchar,
  	"version_hero_rich_text" jsonb,
  	"version_hero_media_id" integer,
  	"version_hero_bordo_immagine" boolean DEFAULT true,
  	"version_hero_sfondo_media" "enum__pages_v_version_hero_sfondo_media" DEFAULT 'immagine',
  	"version_hero_posizione_titolo" "enum__pages_v_version_hero_posizione_titolo",
  	"version_hero_proporzione" "enum__pages_v_version_hero_proporzione",
  	"version_hero_video_sorgente" "enum__pages_v_version_hero_video_sorgente" DEFAULT 'file',
  	"version_hero_video_file_id" integer,
  	"version_hero_video_url" varchar,
  	"version_hero_overlay" "enum__pages_v_version_hero_overlay" DEFAULT 'nessuna',
  	"version_hero_colore_overlay_id" integer,
  	"version_meta_title" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_description" varchar,
  	"version_in_lingua" boolean DEFAULT false,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "posts_locales" (
  	"title" varchar,
  	"content" jsonb,
  	"meta_title" varchar,
  	"meta_image_id" integer,
  	"meta_description" varchar,
  	"in_lingua" boolean DEFAULT false,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_posts_v_locales" (
  	"version_title" varchar,
  	"version_content" jsonb,
  	"version_meta_title" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_description" varchar,
  	"version_in_lingua" boolean DEFAULT false,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "forms_blocks_checkbox_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "forms_blocks_country_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "forms_blocks_email_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "forms_blocks_message_locales" (
  	"message" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "forms_blocks_number_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "forms_blocks_select_options_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "forms_blocks_select_locales" (
  	"label" varchar,
  	"default_value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "forms_blocks_state_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "forms_blocks_text_locales" (
  	"label" varchar,
  	"default_value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "forms_blocks_textarea_locales" (
  	"label" varchar,
  	"default_value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "forms_emails_locales" (
  	"subject" varchar DEFAULT 'You''ve received a new message.' NOT NULL,
  	"message" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "forms_locales" (
  	"submit_button_label" varchar,
  	"confirmation_message" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "categories_locales" (
  	"title" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "search_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "impostazioni_locales" (
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
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "lingue_el" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"codice" "enum_lingue_el_codice" NOT NULL,
  	"bandiera" "enum_lingue_el_bandiera",
  	"attiva" boolean DEFAULT false
  );
  
  CREATE TABLE "lingue" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"stile" "enum_lingue_stile" DEFAULT 'bandiera-nome' NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "seo_locales" (
  	"descrizione_sito" varchar,
  	"ai_llms_presentazione" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "pages" DROP CONSTRAINT "pages_hero_media_id_media_id_fk";
  
  ALTER TABLE "pages" DROP CONSTRAINT "pages_hero_video_file_id_media_id_fk";
  
  ALTER TABLE "pages" DROP CONSTRAINT "pages_hero_colore_overlay_id_colori_id_fk";
  
  ALTER TABLE "pages" DROP CONSTRAINT "pages_meta_image_id_media_id_fk";
  
  ALTER TABLE "_pages_v" DROP CONSTRAINT "_pages_v_version_hero_media_id_media_id_fk";
  
  ALTER TABLE "_pages_v" DROP CONSTRAINT "_pages_v_version_hero_video_file_id_media_id_fk";
  
  ALTER TABLE "_pages_v" DROP CONSTRAINT "_pages_v_version_hero_colore_overlay_id_colori_id_fk";
  
  ALTER TABLE "_pages_v" DROP CONSTRAINT "_pages_v_version_meta_image_id_media_id_fk";
  
  ALTER TABLE "posts" DROP CONSTRAINT "posts_meta_image_id_media_id_fk";
  
  ALTER TABLE "_posts_v" DROP CONSTRAINT "_posts_v_version_meta_image_id_media_id_fk";
  
  DROP INDEX "pages_hero_hero_media_idx";
  DROP INDEX "pages_hero_video_hero_video_file_idx";
  DROP INDEX "pages_hero_hero_colore_overlay_idx";
  DROP INDEX "pages_meta_meta_image_idx";
  DROP INDEX "pages_slug_idx";
  DROP INDEX "_pages_v_version_hero_version_hero_media_idx";
  DROP INDEX "_pages_v_version_hero_video_version_hero_video_file_idx";
  DROP INDEX "_pages_v_version_hero_version_hero_colore_overlay_idx";
  DROP INDEX "_pages_v_version_meta_version_meta_image_idx";
  DROP INDEX "_pages_v_version_version_slug_idx";
  DROP INDEX "posts_meta_meta_image_idx";
  DROP INDEX "posts_slug_idx";
  DROP INDEX "_posts_v_version_meta_version_meta_image_idx";
  DROP INDEX "_posts_v_version_version_slug_idx";
  DROP INDEX "pages_rels_pages_id_idx";
  DROP INDEX "pages_rels_posts_id_idx";
  DROP INDEX "pages_rels_categories_id_idx";
  DROP INDEX "_pages_v_rels_pages_id_idx";
  DROP INDEX "_pages_v_rels_posts_id_idx";
  DROP INDEX "_pages_v_rels_categories_id_idx";
  DROP INDEX "impostazioni_rels_pages_id_idx";
  DROP INDEX "impostazioni_rels_posts_id_idx";
  DROP INDEX "header_rels_pages_id_idx";
  DROP INDEX "header_rels_posts_id_idx";
  DROP INDEX "footer_rels_pages_id_idx";
  DROP INDEX "footer_rels_posts_id_idx";
  ALTER TABLE "pages_hero_links" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "pages_hero_links" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "pages_hero_effetti" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "pages_hero_effetti" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "pages_blocks_cta_links" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "pages_blocks_cta_links" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "pages_blocks_cta" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "pages_blocks_cta" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "pages_blocks_content_columns" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "pages_blocks_content_columns" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "pages_blocks_content" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "pages_blocks_content" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "pages_blocks_media_block" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "pages_blocks_media_block" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "pages_blocks_archive" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "pages_blocks_archive" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "pages_blocks_form_block" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "pages_blocks_form_block" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "pages_blocks_centri_list" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "pages_blocks_centri_list" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "pages_blocks_scheda_prodotto_gruppi_voci" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "pages_blocks_scheda_prodotto_gruppi_voci" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "pages_blocks_scheda_prodotto_gruppi" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "pages_blocks_scheda_prodotto_gruppi" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "parti" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "parti" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "pages_blocks_scheda_prodotto_componenti" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "pages_blocks_scheda_prodotto_componenti" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "pages_blocks_scheda_prodotto" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "pages_blocks_scheda_prodotto" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "pages_blocks_galleria_risultati_voci" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "pages_blocks_galleria_risultati_voci" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "pages_blocks_galleria_risultati" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "pages_blocks_galleria_risultati" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "pages_blocks_mappa" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "pages_blocks_mappa" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "pages_blocks_numeri_evidenza_voci" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "pages_blocks_numeri_evidenza_voci" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "pages_blocks_numeri_evidenza" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "pages_blocks_numeri_evidenza" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "pages_blocks_carosello_schede" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "pages_blocks_carosello_schede" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "pages_blocks_carosello" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "pages_blocks_carosello" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "prod_scorr_pass" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "prod_scorr_pass" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "prod_scorr" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "prod_scorr" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "pages_blocks_barra_prodotto" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "pages_blocks_barra_prodotto" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "pages_blocks_schede_schede" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "pages_blocks_schede_schede" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "pages_blocks_schede" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "pages_blocks_schede" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "pages_blocks_contenitore_effetti" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "pages_blocks_contenitore_effetti" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "pages_blocks_contenitore2_effetti" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "pages_blocks_contenitore2_effetti" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "pages_blocks_contenitore3_effetti" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "pages_blocks_contenitore3_effetti" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "pages_blocks_contenitore3_colonne" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "pages_blocks_contenitore3_colonne" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "pages_blocks_contenitore3" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "pages_blocks_contenitore3" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "pages_blocks_contenitore2_colonne" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "pages_blocks_contenitore2_colonne" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "pages_blocks_contenitore2" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "pages_blocks_contenitore2" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "pages_blocks_contenitore_colonne" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "pages_blocks_contenitore_colonne" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "pages_blocks_contenitore" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "pages_blocks_contenitore" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "pages_rels" ADD COLUMN "locale" "_locales";
  -- Collegamenti dei campi tradotti già presenti: versione italiana
  UPDATE "pages_rels" SET "locale" = 'it';
  ALTER TABLE "_pages_v_version_hero_links" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "_pages_v_version_hero_links" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "_pages_v_version_hero_effetti" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "_pages_v_version_hero_effetti" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_cta_links" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "_pages_v_blocks_cta_links" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_cta" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "_pages_v_blocks_cta" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_content_columns" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "_pages_v_blocks_content_columns" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_content" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "_pages_v_blocks_content" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_media_block" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "_pages_v_blocks_media_block" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_archive" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "_pages_v_blocks_archive" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_form_block" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "_pages_v_blocks_form_block" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_centri_list" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "_pages_v_blocks_centri_list" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_scheda_prodotto_gruppi_voci" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "_pages_v_blocks_scheda_prodotto_gruppi_voci" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_scheda_prodotto_gruppi" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "_pages_v_blocks_scheda_prodotto_gruppi" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "_parti_v" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "_parti_v" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_scheda_prodotto_componenti" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "_pages_v_blocks_scheda_prodotto_componenti" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_scheda_prodotto" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "_pages_v_blocks_scheda_prodotto" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_galleria_risultati_voci" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "_pages_v_blocks_galleria_risultati_voci" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_galleria_risultati" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "_pages_v_blocks_galleria_risultati" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_mappa" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "_pages_v_blocks_mappa" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_numeri_evidenza_voci" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "_pages_v_blocks_numeri_evidenza_voci" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_numeri_evidenza" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "_pages_v_blocks_numeri_evidenza" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_carosello_schede" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "_pages_v_blocks_carosello_schede" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_carosello" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "_pages_v_blocks_carosello" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "_prod_scorr_pass_v" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "_prod_scorr_pass_v" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "_prod_scorr_v" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "_prod_scorr_v" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_barra_prodotto" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "_pages_v_blocks_barra_prodotto" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_schede_schede" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "_pages_v_blocks_schede_schede" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_schede" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "_pages_v_blocks_schede" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_contenitore_effetti" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "_pages_v_blocks_contenitore_effetti" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_contenitore2_effetti" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "_pages_v_blocks_contenitore2_effetti" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_contenitore3_effetti" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "_pages_v_blocks_contenitore3_effetti" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_contenitore3_colonne" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "_pages_v_blocks_contenitore3_colonne" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_contenitore3" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "_pages_v_blocks_contenitore3" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_contenitore2_colonne" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "_pages_v_blocks_contenitore2_colonne" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_contenitore2" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "_pages_v_blocks_contenitore2" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_contenitore_colonne" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "_pages_v_blocks_contenitore_colonne" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_contenitore" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "_pages_v_blocks_contenitore" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "_pages_v" ADD COLUMN "snapshot" boolean;
  ALTER TABLE "_pages_v" ADD COLUMN "published_locale" "enum__pages_v_published_locale";
  ALTER TABLE "_pages_v_rels" ADD COLUMN "locale" "_locales";
  -- Collegamenti dei campi tradotti già presenti: versione italiana
  UPDATE "_pages_v_rels" SET "locale" = 'it';
  ALTER TABLE "_posts_v" ADD COLUMN "snapshot" boolean;
  ALTER TABLE "_posts_v" ADD COLUMN "published_locale" "enum__posts_v_published_locale";
  ALTER TABLE "categories_breadcrumbs" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "categories_breadcrumbs" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "ruoli" ADD COLUMN "traduzioni_en" boolean DEFAULT false;
  ALTER TABLE "ruoli" ADD COLUMN "traduzioni_de" boolean DEFAULT false;
  ALTER TABLE "ruoli" ADD COLUMN "traduzioni_fr" boolean DEFAULT false;
  ALTER TABLE "ruoli" ADD COLUMN "traduzioni_es" boolean DEFAULT false;
  ALTER TABLE "ruoli" ADD COLUMN "traduzioni_pt" boolean DEFAULT false;
  ALTER TABLE "ruoli" ADD COLUMN "traduzioni_nl" boolean DEFAULT false;
  ALTER TABLE "ruoli" ADD COLUMN "traduzioni_pl" boolean DEFAULT false;
  ALTER TABLE "ruoli" ADD COLUMN "traduzioni_ro" boolean DEFAULT false;
  ALTER TABLE "ruoli" ADD COLUMN "traduzioni_cs" boolean DEFAULT false;
  ALTER TABLE "ruoli" ADD COLUMN "traduzioni_el" boolean DEFAULT false;
  ALTER TABLE "ruoli" ADD COLUMN "traduzioni_sv" boolean DEFAULT false;
  ALTER TABLE "ruoli" ADD COLUMN "permessi_lingue_vede" boolean DEFAULT false;
  ALTER TABLE "ruoli" ADD COLUMN "permessi_lingue_modifica" boolean DEFAULT false;
  ALTER TABLE "impostazioni_rels" ADD COLUMN "locale" "_locales";
  -- Collegamenti dei campi tradotti già presenti: versione italiana
  UPDATE "impostazioni_rels" SET "locale" = 'it';
  ALTER TABLE "header_nav_items" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "header_nav_items" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "header_rels" ADD COLUMN "locale" "_locales";
  -- Collegamenti dei campi tradotti già presenti: versione italiana
  UPDATE "header_rels" SET "locale" = 'it';
  ALTER TABLE "footer_nav_items" ADD COLUMN "_locale" "_locales" DEFAULT 'it' NOT NULL;
  ALTER TABLE "footer_nav_items" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "footer_rels" ADD COLUMN "locale" "_locales";
  -- Collegamenti dei campi tradotti già presenti: versione italiana
  UPDATE "footer_rels" SET "locale" = 'it';
  ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_hero_media_id_media_id_fk" FOREIGN KEY ("hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_hero_video_file_id_media_id_fk" FOREIGN KEY ("hero_video_file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_hero_colore_overlay_id_colori_id_fk" FOREIGN KEY ("hero_colore_overlay_id") REFERENCES "public"."colori"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_locales" ADD CONSTRAINT "_pages_v_locales_version_hero_media_id_media_id_fk" FOREIGN KEY ("version_hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_locales" ADD CONSTRAINT "_pages_v_locales_version_hero_video_file_id_media_id_fk" FOREIGN KEY ("version_hero_video_file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_locales" ADD CONSTRAINT "_pages_v_locales_version_hero_colore_overlay_id_colori_id_fk" FOREIGN KEY ("version_hero_colore_overlay_id") REFERENCES "public"."colori"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_locales" ADD CONSTRAINT "_pages_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_locales" ADD CONSTRAINT "_pages_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_locales" ADD CONSTRAINT "posts_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_locales" ADD CONSTRAINT "posts_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_locales" ADD CONSTRAINT "_posts_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_locales" ADD CONSTRAINT "_posts_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_checkbox_locales" ADD CONSTRAINT "forms_blocks_checkbox_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_blocks_checkbox"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_country_locales" ADD CONSTRAINT "forms_blocks_country_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_blocks_country"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_email_locales" ADD CONSTRAINT "forms_blocks_email_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_blocks_email"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_message_locales" ADD CONSTRAINT "forms_blocks_message_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_blocks_message"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_number_locales" ADD CONSTRAINT "forms_blocks_number_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_blocks_number"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_select_options_locales" ADD CONSTRAINT "forms_blocks_select_options_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_blocks_select_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_select_locales" ADD CONSTRAINT "forms_blocks_select_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_blocks_select"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_state_locales" ADD CONSTRAINT "forms_blocks_state_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_blocks_state"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_text_locales" ADD CONSTRAINT "forms_blocks_text_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_blocks_text"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_textarea_locales" ADD CONSTRAINT "forms_blocks_textarea_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_blocks_textarea"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_emails_locales" ADD CONSTRAINT "forms_emails_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_emails"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_locales" ADD CONSTRAINT "forms_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories_locales" ADD CONSTRAINT "categories_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_locales" ADD CONSTRAINT "search_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."search"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "impostazioni_locales" ADD CONSTRAINT "impostazioni_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."impostazioni"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lingue_el" ADD CONSTRAINT "lingue_el_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lingue"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "seo_locales" ADD CONSTRAINT "seo_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."seo"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_hero_hero_media_idx" ON "pages_locales" USING btree ("hero_media_id");
  CREATE INDEX "pages_hero_video_hero_video_file_idx" ON "pages_locales" USING btree ("hero_video_file_id");
  CREATE INDEX "pages_hero_hero_colore_overlay_idx" ON "pages_locales" USING btree ("hero_colore_overlay_id");
  CREATE INDEX "pages_meta_meta_image_idx" ON "pages_locales" USING btree ("meta_image_id");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "pages_locales_locale_parent_id_unique" ON "pages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_locales_parent_id_idx" ON "pages_locales" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_hero_version_hero_media_idx" ON "_pages_v_locales" USING btree ("version_hero_media_id");
  CREATE INDEX "_pages_v_version_hero_video_version_hero_video_file_idx" ON "_pages_v_locales" USING btree ("version_hero_video_file_id");
  CREATE INDEX "_pages_v_version_hero_version_hero_colore_overlay_idx" ON "_pages_v_locales" USING btree ("version_hero_colore_overlay_id");
  CREATE INDEX "_pages_v_version_meta_version_meta_image_idx" ON "_pages_v_locales" USING btree ("version_meta_image_id");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v_locales" USING btree ("version_slug","_locale");
  CREATE UNIQUE INDEX "_pages_v_locales_locale_parent_id_unique" ON "_pages_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_locales_parent_id_idx" ON "_pages_v_locales" USING btree ("_parent_id");
  CREATE INDEX "posts_meta_meta_image_idx" ON "posts_locales" USING btree ("meta_image_id");
  CREATE UNIQUE INDEX "posts_slug_idx" ON "posts_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "posts_locales_locale_parent_id_unique" ON "posts_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "posts_locales_parent_id_idx" ON "posts_locales" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_version_meta_version_meta_image_idx" ON "_posts_v_locales" USING btree ("version_meta_image_id");
  CREATE INDEX "_posts_v_version_version_slug_idx" ON "_posts_v_locales" USING btree ("version_slug","_locale");
  CREATE UNIQUE INDEX "_posts_v_locales_locale_parent_id_unique" ON "_posts_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_posts_v_locales_parent_id_idx" ON "_posts_v_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "forms_blocks_checkbox_locales_locale_parent_id_unique" ON "forms_blocks_checkbox_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "forms_blocks_checkbox_locales_parent_id_idx" ON "forms_blocks_checkbox_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "forms_blocks_country_locales_locale_parent_id_unique" ON "forms_blocks_country_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "forms_blocks_country_locales_parent_id_idx" ON "forms_blocks_country_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "forms_blocks_email_locales_locale_parent_id_unique" ON "forms_blocks_email_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "forms_blocks_email_locales_parent_id_idx" ON "forms_blocks_email_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "forms_blocks_message_locales_locale_parent_id_unique" ON "forms_blocks_message_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "forms_blocks_message_locales_parent_id_idx" ON "forms_blocks_message_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "forms_blocks_number_locales_locale_parent_id_unique" ON "forms_blocks_number_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "forms_blocks_number_locales_parent_id_idx" ON "forms_blocks_number_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "forms_blocks_select_options_locales_locale_parent_id_unique" ON "forms_blocks_select_options_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "forms_blocks_select_options_locales_parent_id_idx" ON "forms_blocks_select_options_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "forms_blocks_select_locales_locale_parent_id_unique" ON "forms_blocks_select_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "forms_blocks_select_locales_parent_id_idx" ON "forms_blocks_select_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "forms_blocks_state_locales_locale_parent_id_unique" ON "forms_blocks_state_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "forms_blocks_state_locales_parent_id_idx" ON "forms_blocks_state_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "forms_blocks_text_locales_locale_parent_id_unique" ON "forms_blocks_text_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "forms_blocks_text_locales_parent_id_idx" ON "forms_blocks_text_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "forms_blocks_textarea_locales_locale_parent_id_unique" ON "forms_blocks_textarea_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "forms_blocks_textarea_locales_parent_id_idx" ON "forms_blocks_textarea_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "forms_emails_locales_locale_parent_id_unique" ON "forms_emails_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "forms_emails_locales_parent_id_idx" ON "forms_emails_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "forms_locales_locale_parent_id_unique" ON "forms_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "forms_locales_parent_id_idx" ON "forms_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "categories_locales_locale_parent_id_unique" ON "categories_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "categories_locales_parent_id_idx" ON "categories_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "search_locales_locale_parent_id_unique" ON "search_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "search_locales_parent_id_idx" ON "search_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "impostazioni_locales_locale_parent_id_unique" ON "impostazioni_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "impostazioni_locales_parent_id_idx" ON "impostazioni_locales" USING btree ("_parent_id");
  CREATE INDEX "lingue_el_order_idx" ON "lingue_el" USING btree ("_order");
  CREATE INDEX "lingue_el_parent_id_idx" ON "lingue_el" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "seo_locales_locale_parent_id_unique" ON "seo_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "seo_locales_parent_id_idx" ON "seo_locales" USING btree ("_parent_id");
  CREATE INDEX "pages_hero_links_locale_idx" ON "pages_hero_links" USING btree ("_locale");
  CREATE INDEX "pages_hero_effetti_locale_idx" ON "pages_hero_effetti" USING btree ("_locale");
  CREATE INDEX "pages_blocks_cta_links_locale_idx" ON "pages_blocks_cta_links" USING btree ("_locale");
  CREATE INDEX "pages_blocks_cta_locale_idx" ON "pages_blocks_cta" USING btree ("_locale");
  CREATE INDEX "pages_blocks_content_columns_locale_idx" ON "pages_blocks_content_columns" USING btree ("_locale");
  CREATE INDEX "pages_blocks_content_locale_idx" ON "pages_blocks_content" USING btree ("_locale");
  CREATE INDEX "pages_blocks_media_block_locale_idx" ON "pages_blocks_media_block" USING btree ("_locale");
  CREATE INDEX "pages_blocks_archive_locale_idx" ON "pages_blocks_archive" USING btree ("_locale");
  CREATE INDEX "pages_blocks_form_block_locale_idx" ON "pages_blocks_form_block" USING btree ("_locale");
  CREATE INDEX "pages_blocks_centri_list_locale_idx" ON "pages_blocks_centri_list" USING btree ("_locale");
  CREATE INDEX "pages_blocks_scheda_prodotto_gruppi_voci_locale_idx" ON "pages_blocks_scheda_prodotto_gruppi_voci" USING btree ("_locale");
  CREATE INDEX "pages_blocks_scheda_prodotto_gruppi_locale_idx" ON "pages_blocks_scheda_prodotto_gruppi" USING btree ("_locale");
  CREATE INDEX "parti_locale_idx" ON "parti" USING btree ("_locale");
  CREATE INDEX "pages_blocks_scheda_prodotto_componenti_locale_idx" ON "pages_blocks_scheda_prodotto_componenti" USING btree ("_locale");
  CREATE INDEX "pages_blocks_scheda_prodotto_locale_idx" ON "pages_blocks_scheda_prodotto" USING btree ("_locale");
  CREATE INDEX "pages_blocks_galleria_risultati_voci_locale_idx" ON "pages_blocks_galleria_risultati_voci" USING btree ("_locale");
  CREATE INDEX "pages_blocks_galleria_risultati_locale_idx" ON "pages_blocks_galleria_risultati" USING btree ("_locale");
  CREATE INDEX "pages_blocks_mappa_locale_idx" ON "pages_blocks_mappa" USING btree ("_locale");
  CREATE INDEX "pages_blocks_numeri_evidenza_voci_locale_idx" ON "pages_blocks_numeri_evidenza_voci" USING btree ("_locale");
  CREATE INDEX "pages_blocks_numeri_evidenza_locale_idx" ON "pages_blocks_numeri_evidenza" USING btree ("_locale");
  CREATE INDEX "pages_blocks_carosello_schede_locale_idx" ON "pages_blocks_carosello_schede" USING btree ("_locale");
  CREATE INDEX "pages_blocks_carosello_locale_idx" ON "pages_blocks_carosello" USING btree ("_locale");
  CREATE INDEX "prod_scorr_pass_locale_idx" ON "prod_scorr_pass" USING btree ("_locale");
  CREATE INDEX "prod_scorr_locale_idx" ON "prod_scorr" USING btree ("_locale");
  CREATE INDEX "pages_blocks_barra_prodotto_locale_idx" ON "pages_blocks_barra_prodotto" USING btree ("_locale");
  CREATE INDEX "pages_blocks_schede_schede_locale_idx" ON "pages_blocks_schede_schede" USING btree ("_locale");
  CREATE INDEX "pages_blocks_schede_locale_idx" ON "pages_blocks_schede" USING btree ("_locale");
  CREATE INDEX "pages_blocks_contenitore_effetti_locale_idx" ON "pages_blocks_contenitore_effetti" USING btree ("_locale");
  CREATE INDEX "pages_blocks_contenitore2_effetti_locale_idx" ON "pages_blocks_contenitore2_effetti" USING btree ("_locale");
  CREATE INDEX "pages_blocks_contenitore3_effetti_locale_idx" ON "pages_blocks_contenitore3_effetti" USING btree ("_locale");
  CREATE INDEX "pages_blocks_contenitore3_colonne_locale_idx" ON "pages_blocks_contenitore3_colonne" USING btree ("_locale");
  CREATE INDEX "pages_blocks_contenitore3_locale_idx" ON "pages_blocks_contenitore3" USING btree ("_locale");
  CREATE INDEX "pages_blocks_contenitore2_colonne_locale_idx" ON "pages_blocks_contenitore2_colonne" USING btree ("_locale");
  CREATE INDEX "pages_blocks_contenitore2_locale_idx" ON "pages_blocks_contenitore2" USING btree ("_locale");
  CREATE INDEX "pages_blocks_contenitore_colonne_locale_idx" ON "pages_blocks_contenitore_colonne" USING btree ("_locale");
  CREATE INDEX "pages_blocks_contenitore_locale_idx" ON "pages_blocks_contenitore" USING btree ("_locale");
  CREATE INDEX "pages_rels_locale_idx" ON "pages_rels" USING btree ("locale");
  CREATE INDEX "_pages_v_version_hero_links_locale_idx" ON "_pages_v_version_hero_links" USING btree ("_locale");
  CREATE INDEX "_pages_v_version_hero_effetti_locale_idx" ON "_pages_v_version_hero_effetti" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_cta_links_locale_idx" ON "_pages_v_blocks_cta_links" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_cta_locale_idx" ON "_pages_v_blocks_cta" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_content_columns_locale_idx" ON "_pages_v_blocks_content_columns" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_content_locale_idx" ON "_pages_v_blocks_content" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_media_block_locale_idx" ON "_pages_v_blocks_media_block" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_archive_locale_idx" ON "_pages_v_blocks_archive" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_form_block_locale_idx" ON "_pages_v_blocks_form_block" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_centri_list_locale_idx" ON "_pages_v_blocks_centri_list" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_scheda_prodotto_gruppi_voci_locale_idx" ON "_pages_v_blocks_scheda_prodotto_gruppi_voci" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_scheda_prodotto_gruppi_locale_idx" ON "_pages_v_blocks_scheda_prodotto_gruppi" USING btree ("_locale");
  CREATE INDEX "_parti_v_locale_idx" ON "_parti_v" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_scheda_prodotto_componenti_locale_idx" ON "_pages_v_blocks_scheda_prodotto_componenti" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_scheda_prodotto_locale_idx" ON "_pages_v_blocks_scheda_prodotto" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_galleria_risultati_voci_locale_idx" ON "_pages_v_blocks_galleria_risultati_voci" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_galleria_risultati_locale_idx" ON "_pages_v_blocks_galleria_risultati" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_mappa_locale_idx" ON "_pages_v_blocks_mappa" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_numeri_evidenza_voci_locale_idx" ON "_pages_v_blocks_numeri_evidenza_voci" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_numeri_evidenza_locale_idx" ON "_pages_v_blocks_numeri_evidenza" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_carosello_schede_locale_idx" ON "_pages_v_blocks_carosello_schede" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_carosello_locale_idx" ON "_pages_v_blocks_carosello" USING btree ("_locale");
  CREATE INDEX "_prod_scorr_pass_v_locale_idx" ON "_prod_scorr_pass_v" USING btree ("_locale");
  CREATE INDEX "_prod_scorr_v_locale_idx" ON "_prod_scorr_v" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_barra_prodotto_locale_idx" ON "_pages_v_blocks_barra_prodotto" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_schede_schede_locale_idx" ON "_pages_v_blocks_schede_schede" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_schede_locale_idx" ON "_pages_v_blocks_schede" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_contenitore_effetti_locale_idx" ON "_pages_v_blocks_contenitore_effetti" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_contenitore2_effetti_locale_idx" ON "_pages_v_blocks_contenitore2_effetti" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_contenitore3_effetti_locale_idx" ON "_pages_v_blocks_contenitore3_effetti" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_contenitore3_colonne_locale_idx" ON "_pages_v_blocks_contenitore3_colonne" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_contenitore3_locale_idx" ON "_pages_v_blocks_contenitore3" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_contenitore2_colonne_locale_idx" ON "_pages_v_blocks_contenitore2_colonne" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_contenitore2_locale_idx" ON "_pages_v_blocks_contenitore2" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_contenitore_colonne_locale_idx" ON "_pages_v_blocks_contenitore_colonne" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_contenitore_locale_idx" ON "_pages_v_blocks_contenitore" USING btree ("_locale");
  CREATE INDEX "_pages_v_snapshot_idx" ON "_pages_v" USING btree ("snapshot");
  CREATE INDEX "_pages_v_published_locale_idx" ON "_pages_v" USING btree ("published_locale");
  CREATE INDEX "_pages_v_rels_locale_idx" ON "_pages_v_rels" USING btree ("locale");
  CREATE INDEX "_posts_v_snapshot_idx" ON "_posts_v" USING btree ("snapshot");
  CREATE INDEX "_posts_v_published_locale_idx" ON "_posts_v" USING btree ("published_locale");
  CREATE INDEX "categories_breadcrumbs_locale_idx" ON "categories_breadcrumbs" USING btree ("_locale");
  CREATE INDEX "impostazioni_rels_locale_idx" ON "impostazioni_rels" USING btree ("locale");
  CREATE INDEX "header_nav_items_locale_idx" ON "header_nav_items" USING btree ("_locale");
  CREATE INDEX "header_rels_locale_idx" ON "header_rels" USING btree ("locale");
  CREATE INDEX "footer_nav_items_locale_idx" ON "footer_nav_items" USING btree ("_locale");
  CREATE INDEX "footer_rels_locale_idx" ON "footer_rels" USING btree ("locale");
  CREATE INDEX "pages_rels_pages_id_idx" ON "pages_rels" USING btree ("pages_id","locale");
  CREATE INDEX "pages_rels_posts_id_idx" ON "pages_rels" USING btree ("posts_id","locale");
  CREATE INDEX "pages_rels_categories_id_idx" ON "pages_rels" USING btree ("categories_id","locale");
  CREATE INDEX "_pages_v_rels_pages_id_idx" ON "_pages_v_rels" USING btree ("pages_id","locale");
  CREATE INDEX "_pages_v_rels_posts_id_idx" ON "_pages_v_rels" USING btree ("posts_id","locale");
  CREATE INDEX "_pages_v_rels_categories_id_idx" ON "_pages_v_rels" USING btree ("categories_id","locale");
  CREATE INDEX "impostazioni_rels_pages_id_idx" ON "impostazioni_rels" USING btree ("pages_id","locale");
  CREATE INDEX "impostazioni_rels_posts_id_idx" ON "impostazioni_rels" USING btree ("posts_id","locale");
  CREATE INDEX "header_rels_pages_id_idx" ON "header_rels" USING btree ("pages_id","locale");
  CREATE INDEX "header_rels_posts_id_idx" ON "header_rels" USING btree ("posts_id","locale");
  CREATE INDEX "footer_rels_pages_id_idx" ON "footer_rels" USING btree ("pages_id","locale");
  CREATE INDEX "footer_rels_posts_id_idx" ON "footer_rels" USING btree ("posts_id","locale");
  -- Testi esistenti: diventano la versione italiana (lingua principale)
  INSERT INTO "pages_locales" ("title", "hero_type", "hero_occhiello", "hero_rich_text", "hero_media_id", "hero_bordo_immagine", "hero_sfondo_media", "hero_posizione_titolo", "hero_proporzione", "hero_video_sorgente", "hero_video_file_id", "hero_video_url", "hero_overlay", "hero_colore_overlay_id", "meta_title", "meta_image_id", "meta_description", "generate_slug", "slug", "in_lingua", "_locale", "_parent_id")
    SELECT "title", "hero_type", "hero_occhiello", "hero_rich_text", "hero_media_id", "hero_bordo_immagine", "hero_sfondo_media", "hero_posizione_titolo", "hero_proporzione", "hero_video_sorgente", "hero_video_file_id", "hero_video_url", "hero_overlay", "hero_colore_overlay_id", "meta_title", "meta_image_id", "meta_description", "generate_slug", "slug", true, 'it', "id" FROM "pages";
  INSERT INTO "_pages_v_locales" ("version_title", "version_hero_type", "version_hero_occhiello", "version_hero_rich_text", "version_hero_media_id", "version_hero_bordo_immagine", "version_hero_sfondo_media", "version_hero_posizione_titolo", "version_hero_proporzione", "version_hero_video_sorgente", "version_hero_video_file_id", "version_hero_video_url", "version_hero_overlay", "version_hero_colore_overlay_id", "version_meta_title", "version_meta_image_id", "version_meta_description", "version_generate_slug", "version_slug", "_locale", "_parent_id")
    SELECT "version_title", "version_hero_type", "version_hero_occhiello", "version_hero_rich_text", "version_hero_media_id", "version_hero_bordo_immagine", "version_hero_sfondo_media", "version_hero_posizione_titolo", "version_hero_proporzione", "version_hero_video_sorgente", "version_hero_video_file_id", "version_hero_video_url", "version_hero_overlay", "version_hero_colore_overlay_id", "version_meta_title", "version_meta_image_id", "version_meta_description", "version_generate_slug", "version_slug", 'it', "id" FROM "_pages_v";
  INSERT INTO "posts_locales" ("title", "content", "meta_title", "meta_image_id", "meta_description", "generate_slug", "slug", "in_lingua", "_locale", "_parent_id")
    SELECT "title", "content", "meta_title", "meta_image_id", "meta_description", "generate_slug", "slug", true, 'it', "id" FROM "posts";
  INSERT INTO "_posts_v_locales" ("version_title", "version_content", "version_meta_title", "version_meta_image_id", "version_meta_description", "version_generate_slug", "version_slug", "_locale", "_parent_id")
    SELECT "version_title", "version_content", "version_meta_title", "version_meta_image_id", "version_meta_description", "version_generate_slug", "version_slug", 'it', "id" FROM "_posts_v";
  INSERT INTO "forms_blocks_checkbox_locales" ("label", "_locale", "_parent_id")
    SELECT "label", 'it', "id" FROM "forms_blocks_checkbox";
  INSERT INTO "forms_blocks_country_locales" ("label", "_locale", "_parent_id")
    SELECT "label", 'it', "id" FROM "forms_blocks_country";
  INSERT INTO "forms_blocks_email_locales" ("label", "_locale", "_parent_id")
    SELECT "label", 'it', "id" FROM "forms_blocks_email";
  INSERT INTO "forms_blocks_message_locales" ("message", "_locale", "_parent_id")
    SELECT "message", 'it', "id" FROM "forms_blocks_message";
  INSERT INTO "forms_blocks_number_locales" ("label", "_locale", "_parent_id")
    SELECT "label", 'it', "id" FROM "forms_blocks_number";
  INSERT INTO "forms_blocks_select_options_locales" ("label", "_locale", "_parent_id")
    SELECT "label", 'it', "id" FROM "forms_blocks_select_options";
  INSERT INTO "forms_blocks_select_locales" ("label", "default_value", "_locale", "_parent_id")
    SELECT "label", "default_value", 'it', "id" FROM "forms_blocks_select";
  INSERT INTO "forms_blocks_state_locales" ("label", "_locale", "_parent_id")
    SELECT "label", 'it', "id" FROM "forms_blocks_state";
  INSERT INTO "forms_blocks_text_locales" ("label", "default_value", "_locale", "_parent_id")
    SELECT "label", "default_value", 'it', "id" FROM "forms_blocks_text";
  INSERT INTO "forms_blocks_textarea_locales" ("label", "default_value", "_locale", "_parent_id")
    SELECT "label", "default_value", 'it', "id" FROM "forms_blocks_textarea";
  INSERT INTO "forms_emails_locales" ("subject", "message", "_locale", "_parent_id")
    SELECT "subject", "message", 'it', "id" FROM "forms_emails";
  INSERT INTO "forms_locales" ("submit_button_label", "confirmation_message", "_locale", "_parent_id")
    SELECT "submit_button_label", "confirmation_message", 'it', "id" FROM "forms";
  INSERT INTO "categories_locales" ("title", "_locale", "_parent_id")
    SELECT "title", 'it', "id" FROM "categories";
  INSERT INTO "search_locales" ("title", "_locale", "_parent_id")
    SELECT "title", 'it', "id" FROM "search";
  INSERT INTO "impostazioni_locales" ("avviso_attivo", "avviso_chiudibile", "avviso_testo", "avviso_stile", "avviso_inizio", "avviso_fine", "avviso_con_link", "avviso_link_type", "avviso_link_new_tab", "avviso_link_url", "avviso_link_label", "_locale", "_parent_id")
    SELECT "avviso_attivo", "avviso_chiudibile", "avviso_testo", "avviso_stile", "avviso_inizio", "avviso_fine", "avviso_con_link", "avviso_link_type", "avviso_link_new_tab", "avviso_link_url", "avviso_link_label", 'it', "id" FROM "impostazioni";
  INSERT INTO "seo_locales" ("descrizione_sito", "ai_llms_presentazione", "_locale", "_parent_id")
    SELECT "descrizione_sito", "ai_llms_presentazione", 'it', "id" FROM "seo";

  ALTER TABLE "pages" DROP COLUMN "title";
  ALTER TABLE "pages" DROP COLUMN "hero_type";
  ALTER TABLE "pages" DROP COLUMN "hero_occhiello";
  ALTER TABLE "pages" DROP COLUMN "hero_rich_text";
  ALTER TABLE "pages" DROP COLUMN "hero_media_id";
  ALTER TABLE "pages" DROP COLUMN "hero_bordo_immagine";
  ALTER TABLE "pages" DROP COLUMN "hero_sfondo_media";
  ALTER TABLE "pages" DROP COLUMN "hero_posizione_titolo";
  ALTER TABLE "pages" DROP COLUMN "hero_proporzione";
  ALTER TABLE "pages" DROP COLUMN "hero_video_sorgente";
  ALTER TABLE "pages" DROP COLUMN "hero_video_file_id";
  ALTER TABLE "pages" DROP COLUMN "hero_video_url";
  ALTER TABLE "pages" DROP COLUMN "hero_overlay";
  ALTER TABLE "pages" DROP COLUMN "hero_colore_overlay_id";
  ALTER TABLE "pages" DROP COLUMN "meta_title";
  ALTER TABLE "pages" DROP COLUMN "meta_image_id";
  ALTER TABLE "pages" DROP COLUMN "meta_description";
  ALTER TABLE "pages" DROP COLUMN "generate_slug";
  ALTER TABLE "pages" DROP COLUMN "slug";
  ALTER TABLE "_pages_v" DROP COLUMN "version_title";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_type";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_occhiello";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_rich_text";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_media_id";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_bordo_immagine";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_sfondo_media";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_posizione_titolo";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_proporzione";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_video_sorgente";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_video_file_id";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_video_url";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_overlay";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_colore_overlay_id";
  ALTER TABLE "_pages_v" DROP COLUMN "version_meta_title";
  ALTER TABLE "_pages_v" DROP COLUMN "version_meta_image_id";
  ALTER TABLE "_pages_v" DROP COLUMN "version_meta_description";
  ALTER TABLE "_pages_v" DROP COLUMN "version_generate_slug";
  ALTER TABLE "_pages_v" DROP COLUMN "version_slug";
  ALTER TABLE "posts" DROP COLUMN "title";
  ALTER TABLE "posts" DROP COLUMN "content";
  ALTER TABLE "posts" DROP COLUMN "meta_title";
  ALTER TABLE "posts" DROP COLUMN "meta_image_id";
  ALTER TABLE "posts" DROP COLUMN "meta_description";
  ALTER TABLE "posts" DROP COLUMN "generate_slug";
  ALTER TABLE "posts" DROP COLUMN "slug";
  ALTER TABLE "_posts_v" DROP COLUMN "version_title";
  ALTER TABLE "_posts_v" DROP COLUMN "version_content";
  ALTER TABLE "_posts_v" DROP COLUMN "version_meta_title";
  ALTER TABLE "_posts_v" DROP COLUMN "version_meta_image_id";
  ALTER TABLE "_posts_v" DROP COLUMN "version_meta_description";
  ALTER TABLE "_posts_v" DROP COLUMN "version_generate_slug";
  ALTER TABLE "_posts_v" DROP COLUMN "version_slug";
  ALTER TABLE "forms_blocks_checkbox" DROP COLUMN "label";
  ALTER TABLE "forms_blocks_country" DROP COLUMN "label";
  ALTER TABLE "forms_blocks_email" DROP COLUMN "label";
  ALTER TABLE "forms_blocks_message" DROP COLUMN "message";
  ALTER TABLE "forms_blocks_number" DROP COLUMN "label";
  ALTER TABLE "forms_blocks_select_options" DROP COLUMN "label";
  ALTER TABLE "forms_blocks_select" DROP COLUMN "label";
  ALTER TABLE "forms_blocks_select" DROP COLUMN "default_value";
  ALTER TABLE "forms_blocks_state" DROP COLUMN "label";
  ALTER TABLE "forms_blocks_text" DROP COLUMN "label";
  ALTER TABLE "forms_blocks_text" DROP COLUMN "default_value";
  ALTER TABLE "forms_blocks_textarea" DROP COLUMN "label";
  ALTER TABLE "forms_blocks_textarea" DROP COLUMN "default_value";
  ALTER TABLE "forms_emails" DROP COLUMN "subject";
  ALTER TABLE "forms_emails" DROP COLUMN "message";
  ALTER TABLE "forms" DROP COLUMN "submit_button_label";
  ALTER TABLE "forms" DROP COLUMN "confirmation_message";
  ALTER TABLE "categories" DROP COLUMN "title";
  ALTER TABLE "search" DROP COLUMN "title";
  ALTER TABLE "impostazioni" DROP COLUMN "avviso_attivo";
  ALTER TABLE "impostazioni" DROP COLUMN "avviso_chiudibile";
  ALTER TABLE "impostazioni" DROP COLUMN "avviso_testo";
  ALTER TABLE "impostazioni" DROP COLUMN "avviso_stile";
  ALTER TABLE "impostazioni" DROP COLUMN "avviso_inizio";
  ALTER TABLE "impostazioni" DROP COLUMN "avviso_fine";
  ALTER TABLE "impostazioni" DROP COLUMN "avviso_con_link";
  ALTER TABLE "impostazioni" DROP COLUMN "avviso_link_type";
  ALTER TABLE "impostazioni" DROP COLUMN "avviso_link_new_tab";
  ALTER TABLE "impostazioni" DROP COLUMN "avviso_link_url";
  ALTER TABLE "impostazioni" DROP COLUMN "avviso_link_label";
  ALTER TABLE "seo" DROP COLUMN "descrizione_sito";
  ALTER TABLE "seo" DROP COLUMN "ai_llms_presentazione";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "forms_blocks_checkbox_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "forms_blocks_country_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "forms_blocks_email_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "forms_blocks_message_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "forms_blocks_number_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "forms_blocks_select_options_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "forms_blocks_select_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "forms_blocks_state_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "forms_blocks_text_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "forms_blocks_textarea_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "forms_emails_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "forms_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "categories_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "search_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "impostazioni_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "lingue_el" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "lingue" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "seo_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_locales" CASCADE;
  DROP TABLE "_pages_v_locales" CASCADE;
  DROP TABLE "posts_locales" CASCADE;
  DROP TABLE "_posts_v_locales" CASCADE;
  DROP TABLE "forms_blocks_checkbox_locales" CASCADE;
  DROP TABLE "forms_blocks_country_locales" CASCADE;
  DROP TABLE "forms_blocks_email_locales" CASCADE;
  DROP TABLE "forms_blocks_message_locales" CASCADE;
  DROP TABLE "forms_blocks_number_locales" CASCADE;
  DROP TABLE "forms_blocks_select_options_locales" CASCADE;
  DROP TABLE "forms_blocks_select_locales" CASCADE;
  DROP TABLE "forms_blocks_state_locales" CASCADE;
  DROP TABLE "forms_blocks_text_locales" CASCADE;
  DROP TABLE "forms_blocks_textarea_locales" CASCADE;
  DROP TABLE "forms_emails_locales" CASCADE;
  DROP TABLE "forms_locales" CASCADE;
  DROP TABLE "categories_locales" CASCADE;
  DROP TABLE "search_locales" CASCADE;
  DROP TABLE "impostazioni_locales" CASCADE;
  DROP TABLE "lingue_el" CASCADE;
  DROP TABLE "lingue" CASCADE;
  DROP TABLE "seo_locales" CASCADE;
  DROP INDEX "pages_hero_links_locale_idx";
  DROP INDEX "pages_hero_effetti_locale_idx";
  DROP INDEX "pages_blocks_cta_links_locale_idx";
  DROP INDEX "pages_blocks_cta_locale_idx";
  DROP INDEX "pages_blocks_content_columns_locale_idx";
  DROP INDEX "pages_blocks_content_locale_idx";
  DROP INDEX "pages_blocks_media_block_locale_idx";
  DROP INDEX "pages_blocks_archive_locale_idx";
  DROP INDEX "pages_blocks_form_block_locale_idx";
  DROP INDEX "pages_blocks_centri_list_locale_idx";
  DROP INDEX "pages_blocks_scheda_prodotto_gruppi_voci_locale_idx";
  DROP INDEX "pages_blocks_scheda_prodotto_gruppi_locale_idx";
  DROP INDEX "parti_locale_idx";
  DROP INDEX "pages_blocks_scheda_prodotto_componenti_locale_idx";
  DROP INDEX "pages_blocks_scheda_prodotto_locale_idx";
  DROP INDEX "pages_blocks_galleria_risultati_voci_locale_idx";
  DROP INDEX "pages_blocks_galleria_risultati_locale_idx";
  DROP INDEX "pages_blocks_mappa_locale_idx";
  DROP INDEX "pages_blocks_numeri_evidenza_voci_locale_idx";
  DROP INDEX "pages_blocks_numeri_evidenza_locale_idx";
  DROP INDEX "pages_blocks_carosello_schede_locale_idx";
  DROP INDEX "pages_blocks_carosello_locale_idx";
  DROP INDEX "prod_scorr_pass_locale_idx";
  DROP INDEX "prod_scorr_locale_idx";
  DROP INDEX "pages_blocks_barra_prodotto_locale_idx";
  DROP INDEX "pages_blocks_schede_schede_locale_idx";
  DROP INDEX "pages_blocks_schede_locale_idx";
  DROP INDEX "pages_blocks_contenitore_effetti_locale_idx";
  DROP INDEX "pages_blocks_contenitore2_effetti_locale_idx";
  DROP INDEX "pages_blocks_contenitore3_effetti_locale_idx";
  DROP INDEX "pages_blocks_contenitore3_colonne_locale_idx";
  DROP INDEX "pages_blocks_contenitore3_locale_idx";
  DROP INDEX "pages_blocks_contenitore2_colonne_locale_idx";
  DROP INDEX "pages_blocks_contenitore2_locale_idx";
  DROP INDEX "pages_blocks_contenitore_colonne_locale_idx";
  DROP INDEX "pages_blocks_contenitore_locale_idx";
  DROP INDEX "pages_rels_locale_idx";
  DROP INDEX "_pages_v_version_hero_links_locale_idx";
  DROP INDEX "_pages_v_version_hero_effetti_locale_idx";
  DROP INDEX "_pages_v_blocks_cta_links_locale_idx";
  DROP INDEX "_pages_v_blocks_cta_locale_idx";
  DROP INDEX "_pages_v_blocks_content_columns_locale_idx";
  DROP INDEX "_pages_v_blocks_content_locale_idx";
  DROP INDEX "_pages_v_blocks_media_block_locale_idx";
  DROP INDEX "_pages_v_blocks_archive_locale_idx";
  DROP INDEX "_pages_v_blocks_form_block_locale_idx";
  DROP INDEX "_pages_v_blocks_centri_list_locale_idx";
  DROP INDEX "_pages_v_blocks_scheda_prodotto_gruppi_voci_locale_idx";
  DROP INDEX "_pages_v_blocks_scheda_prodotto_gruppi_locale_idx";
  DROP INDEX "_parti_v_locale_idx";
  DROP INDEX "_pages_v_blocks_scheda_prodotto_componenti_locale_idx";
  DROP INDEX "_pages_v_blocks_scheda_prodotto_locale_idx";
  DROP INDEX "_pages_v_blocks_galleria_risultati_voci_locale_idx";
  DROP INDEX "_pages_v_blocks_galleria_risultati_locale_idx";
  DROP INDEX "_pages_v_blocks_mappa_locale_idx";
  DROP INDEX "_pages_v_blocks_numeri_evidenza_voci_locale_idx";
  DROP INDEX "_pages_v_blocks_numeri_evidenza_locale_idx";
  DROP INDEX "_pages_v_blocks_carosello_schede_locale_idx";
  DROP INDEX "_pages_v_blocks_carosello_locale_idx";
  DROP INDEX "_prod_scorr_pass_v_locale_idx";
  DROP INDEX "_prod_scorr_v_locale_idx";
  DROP INDEX "_pages_v_blocks_barra_prodotto_locale_idx";
  DROP INDEX "_pages_v_blocks_schede_schede_locale_idx";
  DROP INDEX "_pages_v_blocks_schede_locale_idx";
  DROP INDEX "_pages_v_blocks_contenitore_effetti_locale_idx";
  DROP INDEX "_pages_v_blocks_contenitore2_effetti_locale_idx";
  DROP INDEX "_pages_v_blocks_contenitore3_effetti_locale_idx";
  DROP INDEX "_pages_v_blocks_contenitore3_colonne_locale_idx";
  DROP INDEX "_pages_v_blocks_contenitore3_locale_idx";
  DROP INDEX "_pages_v_blocks_contenitore2_colonne_locale_idx";
  DROP INDEX "_pages_v_blocks_contenitore2_locale_idx";
  DROP INDEX "_pages_v_blocks_contenitore_colonne_locale_idx";
  DROP INDEX "_pages_v_blocks_contenitore_locale_idx";
  DROP INDEX "_pages_v_snapshot_idx";
  DROP INDEX "_pages_v_published_locale_idx";
  DROP INDEX "_pages_v_rels_locale_idx";
  DROP INDEX "_posts_v_snapshot_idx";
  DROP INDEX "_posts_v_published_locale_idx";
  DROP INDEX "categories_breadcrumbs_locale_idx";
  DROP INDEX "impostazioni_rels_locale_idx";
  DROP INDEX "header_nav_items_locale_idx";
  DROP INDEX "header_rels_locale_idx";
  DROP INDEX "footer_nav_items_locale_idx";
  DROP INDEX "footer_rels_locale_idx";
  DROP INDEX "pages_rels_pages_id_idx";
  DROP INDEX "pages_rels_posts_id_idx";
  DROP INDEX "pages_rels_categories_id_idx";
  DROP INDEX "_pages_v_rels_pages_id_idx";
  DROP INDEX "_pages_v_rels_posts_id_idx";
  DROP INDEX "_pages_v_rels_categories_id_idx";
  DROP INDEX "impostazioni_rels_pages_id_idx";
  DROP INDEX "impostazioni_rels_posts_id_idx";
  DROP INDEX "header_rels_pages_id_idx";
  DROP INDEX "header_rels_posts_id_idx";
  DROP INDEX "footer_rels_pages_id_idx";
  DROP INDEX "footer_rels_posts_id_idx";
  ALTER TABLE "pages" ADD COLUMN "title" varchar;
  ALTER TABLE "pages" ADD COLUMN "hero_type" "enum_pages_hero_type" DEFAULT 'lowImpact';
  ALTER TABLE "pages" ADD COLUMN "hero_occhiello" varchar;
  ALTER TABLE "pages" ADD COLUMN "hero_rich_text" jsonb;
  ALTER TABLE "pages" ADD COLUMN "hero_media_id" integer;
  ALTER TABLE "pages" ADD COLUMN "hero_bordo_immagine" boolean DEFAULT true;
  ALTER TABLE "pages" ADD COLUMN "hero_sfondo_media" "enum_pages_hero_sfondo_media" DEFAULT 'immagine';
  ALTER TABLE "pages" ADD COLUMN "hero_posizione_titolo" "enum_pages_hero_posizione_titolo";
  ALTER TABLE "pages" ADD COLUMN "hero_proporzione" "enum_pages_hero_proporzione";
  ALTER TABLE "pages" ADD COLUMN "hero_video_sorgente" "enum_pages_hero_video_sorgente" DEFAULT 'file';
  ALTER TABLE "pages" ADD COLUMN "hero_video_file_id" integer;
  ALTER TABLE "pages" ADD COLUMN "hero_video_url" varchar;
  ALTER TABLE "pages" ADD COLUMN "hero_overlay" "enum_pages_hero_overlay" DEFAULT 'nessuna';
  ALTER TABLE "pages" ADD COLUMN "hero_colore_overlay_id" integer;
  ALTER TABLE "pages" ADD COLUMN "meta_title" varchar;
  ALTER TABLE "pages" ADD COLUMN "meta_image_id" integer;
  ALTER TABLE "pages" ADD COLUMN "meta_description" varchar;
  ALTER TABLE "pages" ADD COLUMN "generate_slug" boolean DEFAULT true;
  ALTER TABLE "pages" ADD COLUMN "slug" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_title" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_type" "enum__pages_v_version_hero_type" DEFAULT 'lowImpact';
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_occhiello" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_rich_text" jsonb;
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_media_id" integer;
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_bordo_immagine" boolean DEFAULT true;
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_sfondo_media" "enum__pages_v_version_hero_sfondo_media" DEFAULT 'immagine';
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_posizione_titolo" "enum__pages_v_version_hero_posizione_titolo";
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_proporzione" "enum__pages_v_version_hero_proporzione";
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_video_sorgente" "enum__pages_v_version_hero_video_sorgente" DEFAULT 'file';
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_video_file_id" integer;
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_video_url" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_overlay" "enum__pages_v_version_hero_overlay" DEFAULT 'nessuna';
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_colore_overlay_id" integer;
  ALTER TABLE "_pages_v" ADD COLUMN "version_meta_title" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_meta_image_id" integer;
  ALTER TABLE "_pages_v" ADD COLUMN "version_meta_description" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_generate_slug" boolean DEFAULT true;
  ALTER TABLE "_pages_v" ADD COLUMN "version_slug" varchar;
  ALTER TABLE "posts" ADD COLUMN "title" varchar;
  ALTER TABLE "posts" ADD COLUMN "content" jsonb;
  ALTER TABLE "posts" ADD COLUMN "meta_title" varchar;
  ALTER TABLE "posts" ADD COLUMN "meta_image_id" integer;
  ALTER TABLE "posts" ADD COLUMN "meta_description" varchar;
  ALTER TABLE "posts" ADD COLUMN "generate_slug" boolean DEFAULT true;
  ALTER TABLE "posts" ADD COLUMN "slug" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_title" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_content" jsonb;
  ALTER TABLE "_posts_v" ADD COLUMN "version_meta_title" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_meta_image_id" integer;
  ALTER TABLE "_posts_v" ADD COLUMN "version_meta_description" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_generate_slug" boolean DEFAULT true;
  ALTER TABLE "_posts_v" ADD COLUMN "version_slug" varchar;
  ALTER TABLE "forms_blocks_checkbox" ADD COLUMN "label" varchar;
  ALTER TABLE "forms_blocks_country" ADD COLUMN "label" varchar;
  ALTER TABLE "forms_blocks_email" ADD COLUMN "label" varchar;
  ALTER TABLE "forms_blocks_message" ADD COLUMN "message" jsonb;
  ALTER TABLE "forms_blocks_number" ADD COLUMN "label" varchar;
  ALTER TABLE "forms_blocks_select_options" ADD COLUMN "label" varchar NOT NULL;
  ALTER TABLE "forms_blocks_select" ADD COLUMN "label" varchar;
  ALTER TABLE "forms_blocks_select" ADD COLUMN "default_value" varchar;
  ALTER TABLE "forms_blocks_state" ADD COLUMN "label" varchar;
  ALTER TABLE "forms_blocks_text" ADD COLUMN "label" varchar;
  ALTER TABLE "forms_blocks_text" ADD COLUMN "default_value" varchar;
  ALTER TABLE "forms_blocks_textarea" ADD COLUMN "label" varchar;
  ALTER TABLE "forms_blocks_textarea" ADD COLUMN "default_value" varchar;
  ALTER TABLE "forms_emails" ADD COLUMN "subject" varchar DEFAULT 'You''ve received a new message.' NOT NULL;
  ALTER TABLE "forms_emails" ADD COLUMN "message" jsonb;
  ALTER TABLE "forms" ADD COLUMN "submit_button_label" varchar;
  ALTER TABLE "forms" ADD COLUMN "confirmation_message" jsonb;
  ALTER TABLE "categories" ADD COLUMN "title" varchar NOT NULL;
  ALTER TABLE "search" ADD COLUMN "title" varchar;
  ALTER TABLE "impostazioni" ADD COLUMN "avviso_attivo" boolean DEFAULT false;
  ALTER TABLE "impostazioni" ADD COLUMN "avviso_chiudibile" boolean DEFAULT true;
  ALTER TABLE "impostazioni" ADD COLUMN "avviso_testo" varchar;
  ALTER TABLE "impostazioni" ADD COLUMN "avviso_stile" "enum_impostazioni_avviso_stile" DEFAULT 'informazione';
  ALTER TABLE "impostazioni" ADD COLUMN "avviso_inizio" timestamp(3) with time zone;
  ALTER TABLE "impostazioni" ADD COLUMN "avviso_fine" timestamp(3) with time zone;
  ALTER TABLE "impostazioni" ADD COLUMN "avviso_con_link" boolean DEFAULT false;
  ALTER TABLE "impostazioni" ADD COLUMN "avviso_link_type" "enum_impostazioni_avviso_link_type" DEFAULT 'reference';
  ALTER TABLE "impostazioni" ADD COLUMN "avviso_link_new_tab" boolean;
  ALTER TABLE "impostazioni" ADD COLUMN "avviso_link_url" varchar;
  ALTER TABLE "impostazioni" ADD COLUMN "avviso_link_label" varchar;
  ALTER TABLE "seo" ADD COLUMN "descrizione_sito" varchar;
  ALTER TABLE "seo" ADD COLUMN "ai_llms_presentazione" varchar;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_hero_media_id_media_id_fk" FOREIGN KEY ("hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_hero_video_file_id_media_id_fk" FOREIGN KEY ("hero_video_file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_hero_colore_overlay_id_colori_id_fk" FOREIGN KEY ("hero_colore_overlay_id") REFERENCES "public"."colori"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_hero_media_id_media_id_fk" FOREIGN KEY ("version_hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_hero_video_file_id_media_id_fk" FOREIGN KEY ("version_hero_video_file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_hero_colore_overlay_id_colori_id_fk" FOREIGN KEY ("version_hero_colore_overlay_id") REFERENCES "public"."colori"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_hero_hero_media_idx" ON "pages" USING btree ("hero_media_id");
  CREATE INDEX "pages_hero_video_hero_video_file_idx" ON "pages" USING btree ("hero_video_file_id");
  CREATE INDEX "pages_hero_hero_colore_overlay_idx" ON "pages" USING btree ("hero_colore_overlay_id");
  CREATE INDEX "pages_meta_meta_image_idx" ON "pages" USING btree ("meta_image_id");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "_pages_v_version_hero_version_hero_media_idx" ON "_pages_v" USING btree ("version_hero_media_id");
  CREATE INDEX "_pages_v_version_hero_video_version_hero_video_file_idx" ON "_pages_v" USING btree ("version_hero_video_file_id");
  CREATE INDEX "_pages_v_version_hero_version_hero_colore_overlay_idx" ON "_pages_v" USING btree ("version_hero_colore_overlay_id");
  CREATE INDEX "_pages_v_version_meta_version_meta_image_idx" ON "_pages_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
  CREATE INDEX "posts_meta_meta_image_idx" ON "posts" USING btree ("meta_image_id");
  CREATE UNIQUE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");
  CREATE INDEX "_posts_v_version_meta_version_meta_image_idx" ON "_posts_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_posts_v_version_version_slug_idx" ON "_posts_v" USING btree ("version_slug");
  CREATE INDEX "pages_rels_pages_id_idx" ON "pages_rels" USING btree ("pages_id");
  CREATE INDEX "pages_rels_posts_id_idx" ON "pages_rels" USING btree ("posts_id");
  CREATE INDEX "pages_rels_categories_id_idx" ON "pages_rels" USING btree ("categories_id");
  CREATE INDEX "_pages_v_rels_pages_id_idx" ON "_pages_v_rels" USING btree ("pages_id");
  CREATE INDEX "_pages_v_rels_posts_id_idx" ON "_pages_v_rels" USING btree ("posts_id");
  CREATE INDEX "_pages_v_rels_categories_id_idx" ON "_pages_v_rels" USING btree ("categories_id");
  CREATE INDEX "impostazioni_rels_pages_id_idx" ON "impostazioni_rels" USING btree ("pages_id");
  CREATE INDEX "impostazioni_rels_posts_id_idx" ON "impostazioni_rels" USING btree ("posts_id");
  CREATE INDEX "header_rels_pages_id_idx" ON "header_rels" USING btree ("pages_id");
  CREATE INDEX "header_rels_posts_id_idx" ON "header_rels" USING btree ("posts_id");
  CREATE INDEX "footer_rels_pages_id_idx" ON "footer_rels" USING btree ("pages_id");
  CREATE INDEX "footer_rels_posts_id_idx" ON "footer_rels" USING btree ("posts_id");
  ALTER TABLE "pages_hero_links" DROP COLUMN "_locale";
  ALTER TABLE "pages_hero_effetti" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_cta_links" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_cta" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_content_columns" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_content" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_media_block" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_archive" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_form_block" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_centri_list" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_scheda_prodotto_gruppi_voci" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_scheda_prodotto_gruppi" DROP COLUMN "_locale";
  ALTER TABLE "parti" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_scheda_prodotto_componenti" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_scheda_prodotto" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_galleria_risultati_voci" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_galleria_risultati" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_mappa" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_numeri_evidenza_voci" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_numeri_evidenza" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_carosello_schede" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_carosello" DROP COLUMN "_locale";
  ALTER TABLE "prod_scorr_pass" DROP COLUMN "_locale";
  ALTER TABLE "prod_scorr" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_barra_prodotto" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_schede_schede" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_schede" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_contenitore_effetti" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_contenitore2_effetti" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_contenitore3_effetti" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_contenitore3_colonne" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_contenitore3" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_contenitore2_colonne" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_contenitore2" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_contenitore_colonne" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_contenitore" DROP COLUMN "_locale";
  ALTER TABLE "pages_rels" DROP COLUMN "locale";
  ALTER TABLE "_pages_v_version_hero_links" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_version_hero_effetti" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_cta_links" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_cta" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_content_columns" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_content" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_media_block" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_archive" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_form_block" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_centri_list" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_scheda_prodotto_gruppi_voci" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_scheda_prodotto_gruppi" DROP COLUMN "_locale";
  ALTER TABLE "_parti_v" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_scheda_prodotto_componenti" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_scheda_prodotto" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_galleria_risultati_voci" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_galleria_risultati" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_mappa" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_numeri_evidenza_voci" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_numeri_evidenza" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_carosello_schede" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_carosello" DROP COLUMN "_locale";
  ALTER TABLE "_prod_scorr_pass_v" DROP COLUMN "_locale";
  ALTER TABLE "_prod_scorr_v" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_barra_prodotto" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_schede_schede" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_schede" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_contenitore_effetti" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_contenitore2_effetti" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_contenitore3_effetti" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_contenitore3_colonne" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_contenitore3" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_contenitore2_colonne" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_contenitore2" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_contenitore_colonne" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_contenitore" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v" DROP COLUMN "snapshot";
  ALTER TABLE "_pages_v" DROP COLUMN "published_locale";
  ALTER TABLE "_pages_v_rels" DROP COLUMN "locale";
  ALTER TABLE "_posts_v" DROP COLUMN "snapshot";
  ALTER TABLE "_posts_v" DROP COLUMN "published_locale";
  ALTER TABLE "categories_breadcrumbs" DROP COLUMN "_locale";
  ALTER TABLE "ruoli" DROP COLUMN "traduzioni_en";
  ALTER TABLE "ruoli" DROP COLUMN "traduzioni_de";
  ALTER TABLE "ruoli" DROP COLUMN "traduzioni_fr";
  ALTER TABLE "ruoli" DROP COLUMN "traduzioni_es";
  ALTER TABLE "ruoli" DROP COLUMN "traduzioni_pt";
  ALTER TABLE "ruoli" DROP COLUMN "traduzioni_nl";
  ALTER TABLE "ruoli" DROP COLUMN "traduzioni_pl";
  ALTER TABLE "ruoli" DROP COLUMN "traduzioni_ro";
  ALTER TABLE "ruoli" DROP COLUMN "traduzioni_cs";
  ALTER TABLE "ruoli" DROP COLUMN "traduzioni_el";
  ALTER TABLE "ruoli" DROP COLUMN "traduzioni_sv";
  ALTER TABLE "ruoli" DROP COLUMN "permessi_lingue_vede";
  ALTER TABLE "ruoli" DROP COLUMN "permessi_lingue_modifica";
  ALTER TABLE "impostazioni_rels" DROP COLUMN "locale";
  ALTER TABLE "header_nav_items" DROP COLUMN "_locale";
  ALTER TABLE "header_rels" DROP COLUMN "locale";
  ALTER TABLE "footer_nav_items" DROP COLUMN "_locale";
  ALTER TABLE "footer_rels" DROP COLUMN "locale";
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum__pages_v_published_locale";
  DROP TYPE "public"."enum__posts_v_published_locale";
  DROP TYPE "public"."enum_lingue_el_codice";
  DROP TYPE "public"."enum_lingue_el_bandiera";
  DROP TYPE "public"."enum_lingue_stile";`)
}
