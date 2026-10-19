import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_torna_su_icona" AS ENUM('freccia', 'punta', 'doppia', 'riga');
  CREATE TYPE "public"."enum_torna_su_posizione" AS ENUM('destra', 'sinistra', 'centro');
  CREATE TYPE "public"."enum_torna_su_forma" AS ENUM('cerchio', 'quadrato');
  CREATE TYPE "public"."enum_torna_su_dimensione" AS ENUM('piccola', 'media', 'grande');
  CREATE TYPE "public"."enum_torna_su_comparsa" AS ENUM('breve', 'mezzo', 'schermo');
  CREATE TABLE "torna_su" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"attivo" boolean DEFAULT true,
  	"telefono" boolean DEFAULT true,
  	"icona" "enum_torna_su_icona" DEFAULT 'freccia',
  	"posizione" "enum_torna_su_posizione" DEFAULT 'destra',
  	"forma" "enum_torna_su_forma" DEFAULT 'cerchio',
  	"dimensione" "enum_torna_su_dimensione" DEFAULT 'media',
  	"comparsa" "enum_torna_su_comparsa" DEFAULT 'schermo',
  	"colore_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "torna_su" ADD CONSTRAINT "torna_su_colore_id_colori_id_fk" FOREIGN KEY ("colore_id") REFERENCES "public"."colori"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "torna_su_colore_idx" ON "torna_su" USING btree ("colore_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "torna_su" CASCADE;
  DROP TYPE "public"."enum_torna_su_icona";
  DROP TYPE "public"."enum_torna_su_posizione";
  DROP TYPE "public"."enum_torna_su_forma";
  DROP TYPE "public"."enum_torna_su_dimensione";
  DROP TYPE "public"."enum_torna_su_comparsa";`)
}
