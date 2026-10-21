import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_locales" ADD COLUMN "nascosta" boolean DEFAULT false;
  ALTER TABLE "_pages_v_locales" ADD COLUMN "version_nascosta" boolean DEFAULT false;
  ALTER TABLE "posts_locales" ADD COLUMN "nascosta" boolean DEFAULT false;
  ALTER TABLE "_posts_v_locales" ADD COLUMN "version_nascosta" boolean DEFAULT false;
  ALTER TABLE "pages_locales" DROP COLUMN "in_lingua";
  ALTER TABLE "_pages_v_locales" DROP COLUMN "version_in_lingua";
  ALTER TABLE "posts_locales" DROP COLUMN "in_lingua";
  ALTER TABLE "_posts_v_locales" DROP COLUMN "version_in_lingua";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_locales" ADD COLUMN "in_lingua" boolean DEFAULT false;
  ALTER TABLE "_pages_v_locales" ADD COLUMN "version_in_lingua" boolean DEFAULT false;
  ALTER TABLE "posts_locales" ADD COLUMN "in_lingua" boolean DEFAULT false;
  ALTER TABLE "_posts_v_locales" ADD COLUMN "version_in_lingua" boolean DEFAULT false;
  ALTER TABLE "pages_locales" DROP COLUMN "nascosta";
  ALTER TABLE "_pages_v_locales" DROP COLUMN "version_nascosta";
  ALTER TABLE "posts_locales" DROP COLUMN "nascosta";
  ALTER TABLE "_posts_v_locales" DROP COLUMN "version_nascosta";`)
}
