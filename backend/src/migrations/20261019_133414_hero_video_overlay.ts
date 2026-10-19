import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_hero_sfondo_media" AS ENUM('immagine', 'video');
  CREATE TYPE "public"."enum_pages_hero_posizione_titolo" AS ENUM('alto-sinistra', 'alto-centro', 'alto-destra', 'centro-sinistra', 'centro-centro', 'centro-destra', 'basso-sinistra', 'basso-centro', 'basso-destra');
  CREATE TYPE "public"."enum_pages_hero_proporzione" AS ENUM('16-9', '21-9', '3-1');
  CREATE TYPE "public"."enum_pages_hero_video_sorgente" AS ENUM('file', 'youtube', 'url');
  CREATE TYPE "public"."enum_pages_hero_overlay" AS ENUM('nessuna', 'leggera', 'media', 'forte');
  CREATE TYPE "public"."enum__pages_v_version_hero_sfondo_media" AS ENUM('immagine', 'video');
  CREATE TYPE "public"."enum__pages_v_version_hero_posizione_titolo" AS ENUM('alto-sinistra', 'alto-centro', 'alto-destra', 'centro-sinistra', 'centro-centro', 'centro-destra', 'basso-sinistra', 'basso-centro', 'basso-destra');
  CREATE TYPE "public"."enum__pages_v_version_hero_proporzione" AS ENUM('16-9', '21-9', '3-1');
  CREATE TYPE "public"."enum__pages_v_version_hero_video_sorgente" AS ENUM('file', 'youtube', 'url');
  CREATE TYPE "public"."enum__pages_v_version_hero_overlay" AS ENUM('nessuna', 'leggera', 'media', 'forte');
  ALTER TABLE "pages" ADD COLUMN "hero_sfondo_media" "enum_pages_hero_sfondo_media" DEFAULT 'immagine';
  ALTER TABLE "pages" ADD COLUMN "hero_posizione_titolo" "enum_pages_hero_posizione_titolo";
  ALTER TABLE "pages" ADD COLUMN "hero_proporzione" "enum_pages_hero_proporzione";
  ALTER TABLE "pages" ADD COLUMN "hero_video_sorgente" "enum_pages_hero_video_sorgente" DEFAULT 'file';
  ALTER TABLE "pages" ADD COLUMN "hero_video_file_id" integer;
  ALTER TABLE "pages" ADD COLUMN "hero_video_url" varchar;
  ALTER TABLE "pages" ADD COLUMN "hero_overlay" "enum_pages_hero_overlay" DEFAULT 'nessuna';
  ALTER TABLE "pages" ADD COLUMN "hero_colore_overlay_id" integer;
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_sfondo_media" "enum__pages_v_version_hero_sfondo_media" DEFAULT 'immagine';
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_posizione_titolo" "enum__pages_v_version_hero_posizione_titolo";
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_proporzione" "enum__pages_v_version_hero_proporzione";
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_video_sorgente" "enum__pages_v_version_hero_video_sorgente" DEFAULT 'file';
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_video_file_id" integer;
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_video_url" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_overlay" "enum__pages_v_version_hero_overlay" DEFAULT 'nessuna';
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_colore_overlay_id" integer;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_hero_video_file_id_media_id_fk" FOREIGN KEY ("hero_video_file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_hero_colore_overlay_id_colori_id_fk" FOREIGN KEY ("hero_colore_overlay_id") REFERENCES "public"."colori"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_hero_video_file_id_media_id_fk" FOREIGN KEY ("version_hero_video_file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_hero_colore_overlay_id_colori_id_fk" FOREIGN KEY ("version_hero_colore_overlay_id") REFERENCES "public"."colori"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_hero_video_hero_video_file_idx" ON "pages" USING btree ("hero_video_file_id");
  CREATE INDEX "pages_hero_hero_colore_overlay_idx" ON "pages" USING btree ("hero_colore_overlay_id");
  CREATE INDEX "_pages_v_version_hero_video_version_hero_video_file_idx" ON "_pages_v" USING btree ("version_hero_video_file_id");
  CREATE INDEX "_pages_v_version_hero_version_hero_colore_overlay_idx" ON "_pages_v" USING btree ("version_hero_colore_overlay_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages" DROP CONSTRAINT "pages_hero_video_file_id_media_id_fk";
  
  ALTER TABLE "pages" DROP CONSTRAINT "pages_hero_colore_overlay_id_colori_id_fk";
  
  ALTER TABLE "_pages_v" DROP CONSTRAINT "_pages_v_version_hero_video_file_id_media_id_fk";
  
  ALTER TABLE "_pages_v" DROP CONSTRAINT "_pages_v_version_hero_colore_overlay_id_colori_id_fk";
  
  DROP INDEX "pages_hero_video_hero_video_file_idx";
  DROP INDEX "pages_hero_hero_colore_overlay_idx";
  DROP INDEX "_pages_v_version_hero_video_version_hero_video_file_idx";
  DROP INDEX "_pages_v_version_hero_version_hero_colore_overlay_idx";
  ALTER TABLE "pages" DROP COLUMN "hero_sfondo_media";
  ALTER TABLE "pages" DROP COLUMN "hero_posizione_titolo";
  ALTER TABLE "pages" DROP COLUMN "hero_proporzione";
  ALTER TABLE "pages" DROP COLUMN "hero_video_sorgente";
  ALTER TABLE "pages" DROP COLUMN "hero_video_file_id";
  ALTER TABLE "pages" DROP COLUMN "hero_video_url";
  ALTER TABLE "pages" DROP COLUMN "hero_overlay";
  ALTER TABLE "pages" DROP COLUMN "hero_colore_overlay_id";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_sfondo_media";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_posizione_titolo";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_proporzione";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_video_sorgente";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_video_file_id";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_video_url";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_overlay";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_colore_overlay_id";
  DROP TYPE "public"."enum_pages_hero_sfondo_media";
  DROP TYPE "public"."enum_pages_hero_posizione_titolo";
  DROP TYPE "public"."enum_pages_hero_proporzione";
  DROP TYPE "public"."enum_pages_hero_video_sorgente";
  DROP TYPE "public"."enum_pages_hero_overlay";
  DROP TYPE "public"."enum__pages_v_version_hero_sfondo_media";
  DROP TYPE "public"."enum__pages_v_version_hero_posizione_titolo";
  DROP TYPE "public"."enum__pages_v_version_hero_proporzione";
  DROP TYPE "public"."enum__pages_v_version_hero_video_sorgente";
  DROP TYPE "public"."enum__pages_v_version_hero_overlay";`)
}
