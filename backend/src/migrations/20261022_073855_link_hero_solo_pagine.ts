import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_hero_links" ADD COLUMN "link_reference_id" integer;
  ALTER TABLE "_pages_v_version_hero_links" ADD COLUMN "link_reference_id" integer;
  ALTER TABLE "pages_hero_links" ADD CONSTRAINT "pages_hero_links_link_reference_id_pages_id_fk" FOREIGN KEY ("link_reference_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_version_hero_links" ADD CONSTRAINT "_pages_v_version_hero_links_link_reference_id_pages_id_fk" FOREIGN KEY ("link_reference_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_hero_links_link_link_reference_idx" ON "pages_hero_links" USING btree ("link_reference_id");
  CREATE INDEX "_pages_v_version_hero_links_link_link_reference_idx" ON "_pages_v_version_hero_links" USING btree ("link_reference_id");`)

  // Collegamenti esistenti: dalla tabella delle relazioni miste alla riga del pulsante (stessa
  // lingua e posizione), poi tolti da lì. I collegamenti a notizie nell'hero non ce n'erano
  await db.execute(sql`
   UPDATE "pages_hero_links" h SET "link_reference_id" = r."pages_id"
     FROM "pages_rels" r
    WHERE r."parent_id" = h."_parent_id" AND r."locale" = h."_locale"
      AND r."path" = 'hero.links.' || (h."_order" - 1) || '.link.reference';
   UPDATE "_pages_v_version_hero_links" h SET "link_reference_id" = r."pages_id"
     FROM "_pages_v_rels" r
    WHERE r."parent_id" = h."_parent_id" AND r."locale" = h."_locale"
      AND r."path" = 'version.hero.links.' || (h."_order" - 1) || '.link.reference';
   DELETE FROM "pages_rels" WHERE "path" LIKE 'hero.links.%';
   DELETE FROM "_pages_v_rels" WHERE "path" LIKE 'version.hero.links.%';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_hero_links" DROP CONSTRAINT "pages_hero_links_link_reference_id_pages_id_fk";
  
  ALTER TABLE "_pages_v_version_hero_links" DROP CONSTRAINT "_pages_v_version_hero_links_link_reference_id_pages_id_fk";
  
  DROP INDEX "pages_hero_links_link_link_reference_idx";
  DROP INDEX "_pages_v_version_hero_links_link_link_reference_idx";
  ALTER TABLE "pages_hero_links" DROP COLUMN "link_reference_id";
  ALTER TABLE "_pages_v_version_hero_links" DROP COLUMN "link_reference_id";`)
}
