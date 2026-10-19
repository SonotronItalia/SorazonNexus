import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_effetti_tipo" AS ENUM('pulsazione', 'scarica', 'particelle', 'onde', 'bagliore');
  CREATE TYPE "public"."enum_effetti_intensita" AS ENUM('bassa', 'media', 'alta');
  CREATE TYPE "public"."enum_effetti_velocita" AS ENUM('lenta', 'normale', 'veloce');
  CREATE TYPE "public"."enum_effetti_posizione" AS ENUM('sinistra', 'centro', 'destra');
  CREATE TABLE "pages_hero_effetti" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"effetto_id" integer,
  	"attivo" boolean DEFAULT true
  );
  
  CREATE TABLE "pages_blocks_contenitore_effetti" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"effetto_id" integer,
  	"attivo" boolean DEFAULT true
  );
  
  CREATE TABLE "pages_blocks_contenitore2_effetti" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"effetto_id" integer,
  	"attivo" boolean DEFAULT true
  );
  
  CREATE TABLE "pages_blocks_contenitore3_effetti" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"effetto_id" integer,
  	"attivo" boolean DEFAULT true
  );
  
  CREATE TABLE "_pages_v_version_hero_effetti" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"effetto_id" integer,
  	"attivo" boolean DEFAULT true,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_contenitore_effetti" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"effetto_id" integer,
  	"attivo" boolean DEFAULT true,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_contenitore2_effetti" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"effetto_id" integer,
  	"attivo" boolean DEFAULT true,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_contenitore3_effetti" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"effetto_id" integer,
  	"attivo" boolean DEFAULT true,
  	"_uuid" varchar
  );
  
  CREATE TABLE "effetti" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nome" varchar NOT NULL,
  	"attivo" boolean DEFAULT true,
  	"tipo" "enum_effetti_tipo" NOT NULL,
  	"colore_id" integer,
  	"intensita" "enum_effetti_intensita" DEFAULT 'media',
  	"velocita" "enum_effetti_velocita" DEFAULT 'normale',
  	"posizione" "enum_effetti_posizione" DEFAULT 'destra',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "effetti_id" integer;
  ALTER TABLE "pages_hero_effetti" ADD CONSTRAINT "pages_hero_effetti_effetto_id_effetti_id_fk" FOREIGN KEY ("effetto_id") REFERENCES "public"."effetti"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_hero_effetti" ADD CONSTRAINT "pages_hero_effetti_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_contenitore_effetti" ADD CONSTRAINT "pages_blocks_contenitore_effetti_effetto_id_effetti_id_fk" FOREIGN KEY ("effetto_id") REFERENCES "public"."effetti"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_contenitore_effetti" ADD CONSTRAINT "pages_blocks_contenitore_effetti_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_contenitore"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_contenitore2_effetti" ADD CONSTRAINT "pages_blocks_contenitore2_effetti_effetto_id_effetti_id_fk" FOREIGN KEY ("effetto_id") REFERENCES "public"."effetti"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_contenitore2_effetti" ADD CONSTRAINT "pages_blocks_contenitore2_effetti_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_contenitore2"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_contenitore3_effetti" ADD CONSTRAINT "pages_blocks_contenitore3_effetti_effetto_id_effetti_id_fk" FOREIGN KEY ("effetto_id") REFERENCES "public"."effetti"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_contenitore3_effetti" ADD CONSTRAINT "pages_blocks_contenitore3_effetti_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_contenitore3"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_hero_effetti" ADD CONSTRAINT "_pages_v_version_hero_effetti_effetto_id_effetti_id_fk" FOREIGN KEY ("effetto_id") REFERENCES "public"."effetti"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_version_hero_effetti" ADD CONSTRAINT "_pages_v_version_hero_effetti_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contenitore_effetti" ADD CONSTRAINT "_pages_v_blocks_contenitore_effetti_effetto_id_effetti_id_fk" FOREIGN KEY ("effetto_id") REFERENCES "public"."effetti"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contenitore_effetti" ADD CONSTRAINT "_pages_v_blocks_contenitore_effetti_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_contenitore"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contenitore2_effetti" ADD CONSTRAINT "_pages_v_blocks_contenitore2_effetti_effetto_id_effetti_id_fk" FOREIGN KEY ("effetto_id") REFERENCES "public"."effetti"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contenitore2_effetti" ADD CONSTRAINT "_pages_v_blocks_contenitore2_effetti_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_contenitore2"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contenitore3_effetti" ADD CONSTRAINT "_pages_v_blocks_contenitore3_effetti_effetto_id_effetti_id_fk" FOREIGN KEY ("effetto_id") REFERENCES "public"."effetti"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contenitore3_effetti" ADD CONSTRAINT "_pages_v_blocks_contenitore3_effetti_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_contenitore3"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "effetti" ADD CONSTRAINT "effetti_colore_id_colori_id_fk" FOREIGN KEY ("colore_id") REFERENCES "public"."colori"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_hero_effetti_order_idx" ON "pages_hero_effetti" USING btree ("_order");
  CREATE INDEX "pages_hero_effetti_parent_id_idx" ON "pages_hero_effetti" USING btree ("_parent_id");
  CREATE INDEX "pages_hero_effetti_effetto_idx" ON "pages_hero_effetti" USING btree ("effetto_id");
  CREATE INDEX "pages_blocks_contenitore_effetti_order_idx" ON "pages_blocks_contenitore_effetti" USING btree ("_order");
  CREATE INDEX "pages_blocks_contenitore_effetti_parent_id_idx" ON "pages_blocks_contenitore_effetti" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_contenitore_effetti_effetto_idx" ON "pages_blocks_contenitore_effetti" USING btree ("effetto_id");
  CREATE INDEX "pages_blocks_contenitore2_effetti_order_idx" ON "pages_blocks_contenitore2_effetti" USING btree ("_order");
  CREATE INDEX "pages_blocks_contenitore2_effetti_parent_id_idx" ON "pages_blocks_contenitore2_effetti" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_contenitore2_effetti_effetto_idx" ON "pages_blocks_contenitore2_effetti" USING btree ("effetto_id");
  CREATE INDEX "pages_blocks_contenitore3_effetti_order_idx" ON "pages_blocks_contenitore3_effetti" USING btree ("_order");
  CREATE INDEX "pages_blocks_contenitore3_effetti_parent_id_idx" ON "pages_blocks_contenitore3_effetti" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_contenitore3_effetti_effetto_idx" ON "pages_blocks_contenitore3_effetti" USING btree ("effetto_id");
  CREATE INDEX "_pages_v_version_hero_effetti_order_idx" ON "_pages_v_version_hero_effetti" USING btree ("_order");
  CREATE INDEX "_pages_v_version_hero_effetti_parent_id_idx" ON "_pages_v_version_hero_effetti" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_hero_effetti_effetto_idx" ON "_pages_v_version_hero_effetti" USING btree ("effetto_id");
  CREATE INDEX "_pages_v_blocks_contenitore_effetti_order_idx" ON "_pages_v_blocks_contenitore_effetti" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_contenitore_effetti_parent_id_idx" ON "_pages_v_blocks_contenitore_effetti" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_contenitore_effetti_effetto_idx" ON "_pages_v_blocks_contenitore_effetti" USING btree ("effetto_id");
  CREATE INDEX "_pages_v_blocks_contenitore2_effetti_order_idx" ON "_pages_v_blocks_contenitore2_effetti" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_contenitore2_effetti_parent_id_idx" ON "_pages_v_blocks_contenitore2_effetti" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_contenitore2_effetti_effetto_idx" ON "_pages_v_blocks_contenitore2_effetti" USING btree ("effetto_id");
  CREATE INDEX "_pages_v_blocks_contenitore3_effetti_order_idx" ON "_pages_v_blocks_contenitore3_effetti" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_contenitore3_effetti_parent_id_idx" ON "_pages_v_blocks_contenitore3_effetti" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_contenitore3_effetti_effetto_idx" ON "_pages_v_blocks_contenitore3_effetti" USING btree ("effetto_id");
  CREATE UNIQUE INDEX "effetti_nome_idx" ON "effetti" USING btree ("nome");
  CREATE INDEX "effetti_colore_idx" ON "effetti" USING btree ("colore_id");
  CREATE INDEX "effetti_updated_at_idx" ON "effetti" USING btree ("updated_at");
  CREATE INDEX "effetti_created_at_idx" ON "effetti" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_effetti_fk" FOREIGN KEY ("effetti_id") REFERENCES "public"."effetti"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_effetti_id_idx" ON "payload_locked_documents_rels" USING btree ("effetti_id");
  -- Le caselle dell'hero Sorazon diventano effetti della sezione "Effetti", con lo stesso aspetto
  -- (colore vuoto = colore tipico). Casella spenta = effetto presente ma "Attivo qui" spento.
  INSERT INTO "effetti" ("nome", "tipo", "attivo", "posizione") VALUES
    ('Pulsazione', 'pulsazione', true, 'centro'),
    ('Scarica di Tesla', 'scarica', true, 'destra');
  INSERT INTO "pages_hero_effetti" ("_order", "_parent_id", "id", "effetto_id", "attivo")
    SELECT 1, p."id", substr(md5(random()::text || p."id"::text || 'p'), 1, 24),
      (SELECT "id" FROM "effetti" WHERE "nome" = 'Pulsazione'), COALESCE(p."hero_effetto_pulsazione", true)
    FROM "pages" p WHERE p."hero_type" = 'sorazon';
  INSERT INTO "pages_hero_effetti" ("_order", "_parent_id", "id", "effetto_id", "attivo")
    SELECT 2, p."id", substr(md5(random()::text || p."id"::text || 's'), 1, 24),
      (SELECT "id" FROM "effetti" WHERE "nome" = 'Scarica di Tesla'), COALESCE(p."hero_effetto_scarica", false)
    FROM "pages" p WHERE p."hero_type" = 'sorazon';
  INSERT INTO "_pages_v_version_hero_effetti" ("_order", "_parent_id", "effetto_id", "attivo", "_uuid")
    SELECT 1, v."id", (SELECT "id" FROM "effetti" WHERE "nome" = 'Pulsazione'),
      COALESCE(v."version_hero_effetto_pulsazione", true), substr(md5(random()::text || v."id"::text || 'p'), 1, 24)
    FROM "_pages_v" v WHERE v."version_hero_type" = 'sorazon';
  INSERT INTO "_pages_v_version_hero_effetti" ("_order", "_parent_id", "effetto_id", "attivo", "_uuid")
    SELECT 2, v."id", (SELECT "id" FROM "effetti" WHERE "nome" = 'Scarica di Tesla'),
      COALESCE(v."version_hero_effetto_scarica", false), substr(md5(random()::text || v."id"::text || 's'), 1, 24)
    FROM "_pages_v" v WHERE v."version_hero_type" = 'sorazon';
  ALTER TABLE "pages" DROP COLUMN "hero_effetto_pulsazione";
  ALTER TABLE "pages" DROP COLUMN "hero_effetto_scarica";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_effetto_pulsazione";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_effetto_scarica";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "pages" ADD COLUMN "hero_effetto_pulsazione" boolean DEFAULT true;
  ALTER TABLE "pages" ADD COLUMN "hero_effetto_scarica" boolean DEFAULT false;
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_effetto_pulsazione" boolean DEFAULT true;
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_effetto_scarica" boolean DEFAULT false;
  -- Le caselle tornano accese se l'hero aveva un effetto di quel tipo attivo
  UPDATE "pages" p SET
    "hero_effetto_pulsazione" = EXISTS (SELECT 1 FROM "pages_hero_effetti" he JOIN "effetti" e ON e."id" = he."effetto_id"
      WHERE he."_parent_id" = p."id" AND e."tipo" = 'pulsazione' AND he."attivo"),
    "hero_effetto_scarica" = EXISTS (SELECT 1 FROM "pages_hero_effetti" he JOIN "effetti" e ON e."id" = he."effetto_id"
      WHERE he."_parent_id" = p."id" AND e."tipo" = 'scarica' AND he."attivo");
  UPDATE "_pages_v" v SET
    "version_hero_effetto_pulsazione" = EXISTS (SELECT 1 FROM "_pages_v_version_hero_effetti" he JOIN "effetti" e ON e."id" = he."effetto_id"
      WHERE he."_parent_id" = v."id" AND e."tipo" = 'pulsazione' AND he."attivo"),
    "version_hero_effetto_scarica" = EXISTS (SELECT 1 FROM "_pages_v_version_hero_effetti" he JOIN "effetti" e ON e."id" = he."effetto_id"
      WHERE he."_parent_id" = v."id" AND e."tipo" = 'scarica' AND he."attivo");
   ALTER TABLE "pages_hero_effetti" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_contenitore_effetti" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_contenitore2_effetti" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_contenitore3_effetti" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_hero_effetti" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_contenitore_effetti" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_contenitore2_effetti" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_contenitore3_effetti" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "effetti" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_hero_effetti" CASCADE;
  DROP TABLE "pages_blocks_contenitore_effetti" CASCADE;
  DROP TABLE "pages_blocks_contenitore2_effetti" CASCADE;
  DROP TABLE "pages_blocks_contenitore3_effetti" CASCADE;
  DROP TABLE "_pages_v_version_hero_effetti" CASCADE;
  DROP TABLE "_pages_v_blocks_contenitore_effetti" CASCADE;
  DROP TABLE "_pages_v_blocks_contenitore2_effetti" CASCADE;
  DROP TABLE "_pages_v_blocks_contenitore3_effetti" CASCADE;
  DROP TABLE "effetti" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_effetti_fk";
  
  DROP INDEX "payload_locked_documents_rels_effetti_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "effetti_id";
  DROP TYPE "public"."enum_effetti_tipo";
  DROP TYPE "public"."enum_effetti_intensita";
  DROP TYPE "public"."enum_effetti_velocita";
  DROP TYPE "public"."enum_effetti_posizione";`)
}
