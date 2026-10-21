import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages" ADD COLUMN "deleted_at" timestamp(3) with time zone;
  ALTER TABLE "_pages_v" ADD COLUMN "version_deleted_at" timestamp(3) with time zone;
  ALTER TABLE "posts" ADD COLUMN "deleted_at" timestamp(3) with time zone;
  ALTER TABLE "_posts_v" ADD COLUMN "version_deleted_at" timestamp(3) with time zone;
  ALTER TABLE "centri" ADD COLUMN "deleted_at" timestamp(3) with time zone;
  ALTER TABLE "media" ADD COLUMN "deleted_at" timestamp(3) with time zone;
  ALTER TABLE "forms" ADD COLUMN "deleted_at" timestamp(3) with time zone;
  CREATE INDEX "pages_deleted_at_idx" ON "pages" USING btree ("deleted_at");
  CREATE INDEX "_pages_v_version_version_deleted_at_idx" ON "_pages_v" USING btree ("version_deleted_at");
  CREATE INDEX "posts_deleted_at_idx" ON "posts" USING btree ("deleted_at");
  CREATE INDEX "_posts_v_version_version_deleted_at_idx" ON "_posts_v" USING btree ("version_deleted_at");
  CREATE INDEX "centri_deleted_at_idx" ON "centri" USING btree ("deleted_at");
  CREATE INDEX "media_deleted_at_idx" ON "media" USING btree ("deleted_at");
  CREATE INDEX "forms_deleted_at_idx" ON "forms" USING btree ("deleted_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "pages_deleted_at_idx";
  DROP INDEX "_pages_v_version_version_deleted_at_idx";
  DROP INDEX "posts_deleted_at_idx";
  DROP INDEX "_posts_v_version_version_deleted_at_idx";
  DROP INDEX "centri_deleted_at_idx";
  DROP INDEX "media_deleted_at_idx";
  DROP INDEX "forms_deleted_at_idx";
  ALTER TABLE "pages" DROP COLUMN "deleted_at";
  ALTER TABLE "_pages_v" DROP COLUMN "version_deleted_at";
  ALTER TABLE "posts" DROP COLUMN "deleted_at";
  ALTER TABLE "_posts_v" DROP COLUMN "version_deleted_at";
  ALTER TABLE "centri" DROP COLUMN "deleted_at";
  ALTER TABLE "media" DROP COLUMN "deleted_at";
  ALTER TABLE "forms" DROP COLUMN "deleted_at";`)
}
