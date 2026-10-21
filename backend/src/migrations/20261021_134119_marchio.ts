import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "marchio" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "marchio_id" integer;
  ALTER TABLE "impostazioni" ADD COLUMN "marchio_positivo_id" integer;
  ALTER TABLE "impostazioni" ADD COLUMN "marchio_negativo_id" integer;
  ALTER TABLE "impostazioni" ADD COLUMN "marchio_compatto_id" integer;
  ALTER TABLE "impostazioni" ADD COLUMN "marchio_compatto_negativo_id" integer;
  ALTER TABLE "impostazioni" ADD COLUMN "marchio_piede_id" integer;
  ALTER TABLE "impostazioni" ADD COLUMN "marchio_icona_id" integer;
  ALTER TABLE "impostazioni" ADD COLUMN "marchio_icona_scura_id" integer;
  CREATE INDEX "marchio_updated_at_idx" ON "marchio" USING btree ("updated_at");
  CREATE INDEX "marchio_created_at_idx" ON "marchio" USING btree ("created_at");
  CREATE UNIQUE INDEX "marchio_filename_idx" ON "marchio" USING btree ("filename");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_marchio_fk" FOREIGN KEY ("marchio_id") REFERENCES "public"."marchio"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "impostazioni" ADD CONSTRAINT "impostazioni_marchio_positivo_id_marchio_id_fk" FOREIGN KEY ("marchio_positivo_id") REFERENCES "public"."marchio"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "impostazioni" ADD CONSTRAINT "impostazioni_marchio_negativo_id_marchio_id_fk" FOREIGN KEY ("marchio_negativo_id") REFERENCES "public"."marchio"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "impostazioni" ADD CONSTRAINT "impostazioni_marchio_compatto_id_marchio_id_fk" FOREIGN KEY ("marchio_compatto_id") REFERENCES "public"."marchio"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "impostazioni" ADD CONSTRAINT "impostazioni_marchio_compatto_negativo_id_marchio_id_fk" FOREIGN KEY ("marchio_compatto_negativo_id") REFERENCES "public"."marchio"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "impostazioni" ADD CONSTRAINT "impostazioni_marchio_piede_id_marchio_id_fk" FOREIGN KEY ("marchio_piede_id") REFERENCES "public"."marchio"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "impostazioni" ADD CONSTRAINT "impostazioni_marchio_icona_id_marchio_id_fk" FOREIGN KEY ("marchio_icona_id") REFERENCES "public"."marchio"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "impostazioni" ADD CONSTRAINT "impostazioni_marchio_icona_scura_id_marchio_id_fk" FOREIGN KEY ("marchio_icona_scura_id") REFERENCES "public"."marchio"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_marchio_id_idx" ON "payload_locked_documents_rels" USING btree ("marchio_id");
  CREATE INDEX "impostazioni_marchio_marchio_positivo_idx" ON "impostazioni" USING btree ("marchio_positivo_id");
  CREATE INDEX "impostazioni_marchio_marchio_negativo_idx" ON "impostazioni" USING btree ("marchio_negativo_id");
  CREATE INDEX "impostazioni_marchio_marchio_compatto_idx" ON "impostazioni" USING btree ("marchio_compatto_id");
  CREATE INDEX "impostazioni_marchio_marchio_compatto_negativo_idx" ON "impostazioni" USING btree ("marchio_compatto_negativo_id");
  CREATE INDEX "impostazioni_marchio_marchio_piede_idx" ON "impostazioni" USING btree ("marchio_piede_id");
  CREATE INDEX "impostazioni_marchio_marchio_icona_idx" ON "impostazioni" USING btree ("marchio_icona_id");
  CREATE INDEX "impostazioni_marchio_marchio_icona_scura_idx" ON "impostazioni" USING btree ("marchio_icona_scura_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "marchio" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "marchio" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_marchio_fk";
  
  ALTER TABLE "impostazioni" DROP CONSTRAINT "impostazioni_marchio_positivo_id_marchio_id_fk";
  
  ALTER TABLE "impostazioni" DROP CONSTRAINT "impostazioni_marchio_negativo_id_marchio_id_fk";
  
  ALTER TABLE "impostazioni" DROP CONSTRAINT "impostazioni_marchio_compatto_id_marchio_id_fk";
  
  ALTER TABLE "impostazioni" DROP CONSTRAINT "impostazioni_marchio_compatto_negativo_id_marchio_id_fk";
  
  ALTER TABLE "impostazioni" DROP CONSTRAINT "impostazioni_marchio_piede_id_marchio_id_fk";
  
  ALTER TABLE "impostazioni" DROP CONSTRAINT "impostazioni_marchio_icona_id_marchio_id_fk";
  
  ALTER TABLE "impostazioni" DROP CONSTRAINT "impostazioni_marchio_icona_scura_id_marchio_id_fk";
  
  DROP INDEX "payload_locked_documents_rels_marchio_id_idx";
  DROP INDEX "impostazioni_marchio_marchio_positivo_idx";
  DROP INDEX "impostazioni_marchio_marchio_negativo_idx";
  DROP INDEX "impostazioni_marchio_marchio_compatto_idx";
  DROP INDEX "impostazioni_marchio_marchio_compatto_negativo_idx";
  DROP INDEX "impostazioni_marchio_marchio_piede_idx";
  DROP INDEX "impostazioni_marchio_marchio_icona_idx";
  DROP INDEX "impostazioni_marchio_marchio_icona_scura_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "marchio_id";
  ALTER TABLE "impostazioni" DROP COLUMN "marchio_positivo_id";
  ALTER TABLE "impostazioni" DROP COLUMN "marchio_negativo_id";
  ALTER TABLE "impostazioni" DROP COLUMN "marchio_compatto_id";
  ALTER TABLE "impostazioni" DROP COLUMN "marchio_compatto_negativo_id";
  ALTER TABLE "impostazioni" DROP COLUMN "marchio_piede_id";
  ALTER TABLE "impostazioni" DROP COLUMN "marchio_icona_id";
  ALTER TABLE "impostazioni" DROP COLUMN "marchio_icona_scura_id";`)
}
