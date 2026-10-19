import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_scheda_prodotto_gruppi_voci" ADD COLUMN "visibile" boolean DEFAULT true;
  ALTER TABLE "parti" ADD COLUMN "visibile" boolean DEFAULT true;
  ALTER TABLE "_pages_v_blocks_scheda_prodotto_gruppi_voci" ADD COLUMN "visibile" boolean DEFAULT true;
  ALTER TABLE "_parti_v" ADD COLUMN "visibile" boolean DEFAULT true;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_scheda_prodotto_gruppi_voci" DROP COLUMN "visibile";
  ALTER TABLE "parti" DROP COLUMN "visibile";
  ALTER TABLE "_pages_v_blocks_scheda_prodotto_gruppi_voci" DROP COLUMN "visibile";
  ALTER TABLE "_parti_v" DROP COLUMN "visibile";`)
}
