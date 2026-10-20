import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_form_block_sfondo" AS ENUM('nessuno', 'scuro', 'chiaro', 'tenue');
  CREATE TYPE "public"."enum_pages_blocks_mappa_sfondo" AS ENUM('nessuno', 'scuro', 'chiaro', 'tenue');
  CREATE TYPE "public"."enum__pages_v_blocks_form_block_sfondo" AS ENUM('nessuno', 'scuro', 'chiaro', 'tenue');
  CREATE TYPE "public"."enum__pages_v_blocks_mappa_sfondo" AS ENUM('nessuno', 'scuro', 'chiaro', 'tenue');
  ALTER TABLE "pages_blocks_form_block" ADD COLUMN "sfondo" "enum_pages_blocks_form_block_sfondo" DEFAULT 'nessuno';
  ALTER TABLE "pages_blocks_mappa" ADD COLUMN "sfondo" "enum_pages_blocks_mappa_sfondo" DEFAULT 'nessuno';
  ALTER TABLE "_pages_v_blocks_form_block" ADD COLUMN "sfondo" "enum__pages_v_blocks_form_block_sfondo" DEFAULT 'nessuno';
  ALTER TABLE "_pages_v_blocks_mappa" ADD COLUMN "sfondo" "enum__pages_v_blocks_mappa_sfondo" DEFAULT 'nessuno';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_form_block" DROP COLUMN "sfondo";
  ALTER TABLE "pages_blocks_mappa" DROP COLUMN "sfondo";
  ALTER TABLE "_pages_v_blocks_form_block" DROP COLUMN "sfondo";
  ALTER TABLE "_pages_v_blocks_mappa" DROP COLUMN "sfondo";
  DROP TYPE "public"."enum_pages_blocks_form_block_sfondo";
  DROP TYPE "public"."enum_pages_blocks_mappa_sfondo";
  DROP TYPE "public"."enum__pages_v_blocks_form_block_sfondo";
  DROP TYPE "public"."enum__pages_v_blocks_mappa_sfondo";`)
}
