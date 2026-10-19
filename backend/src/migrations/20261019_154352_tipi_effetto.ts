import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_effetti_tipo" ADD VALUE 'personalizzato';
  CREATE TABLE "tipi_effetto" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nome" varchar NOT NULL,
  	"descrizione" varchar,
  	"javascript" varchar DEFAULT '// Disegna sul canvas "effetto". Parametri in window.EFFETTO:
  //   colore ("#rrggbb"), intensita (0.5 / 1 / 1.4), velocita (0.6 / 1 / 1.5), puntoX (0-1)
  // Usa requestAnimationFrame e movimenti lenti: niente lampeggi.
  const { colore, intensita, velocita } = window.EFFETTO
  const canvas = document.getElementById(''effetto'')
  const ctx = canvas.getContext(''2d'')
  let stelle = []
  
  function ridimensiona() {
    canvas.width = canvas.clientWidth * devicePixelRatio
    canvas.height = canvas.clientHeight * devicePixelRatio
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0)
    stelle = Array.from({ length: Math.round(50 * intensita) }, () => ({
      x: Math.random() * canvas.clientWidth,
      y: Math.random() * canvas.clientHeight,
      r: 0.5 + Math.random() * 1.5,
      fase: Math.random() * Math.PI * 2,
    }))
  }
  
  function disegna(t) {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight)
    ctx.fillStyle = colore
    for (const s of stelle) {
      // Luminosità che varia in alcuni secondi (lenta, mai a scatti)
      ctx.globalAlpha = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(s.fase + (t / 1500) * velocita))
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
      ctx.fill()
    }
    requestAnimationFrame(disegna)
  }
  
  addEventListener(''resize'', ridimensiona)
  ridimensiona()
  requestAnimationFrame(disegna)
  ',
  	"css" varchar,
  	"verificato" boolean DEFAULT false NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "effetti" ADD COLUMN "tipo_personalizzato_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "tipi_effetto_id" integer;
  CREATE UNIQUE INDEX "tipi_effetto_nome_idx" ON "tipi_effetto" USING btree ("nome");
  CREATE INDEX "tipi_effetto_updated_at_idx" ON "tipi_effetto" USING btree ("updated_at");
  CREATE INDEX "tipi_effetto_created_at_idx" ON "tipi_effetto" USING btree ("created_at");
  ALTER TABLE "effetti" ADD CONSTRAINT "effetti_tipo_personalizzato_id_tipi_effetto_id_fk" FOREIGN KEY ("tipo_personalizzato_id") REFERENCES "public"."tipi_effetto"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tipi_effetto_fk" FOREIGN KEY ("tipi_effetto_id") REFERENCES "public"."tipi_effetto"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "effetti_tipo_personalizzato_idx" ON "effetti" USING btree ("tipo_personalizzato_id");
  CREATE INDEX "payload_locked_documents_rels_tipi_effetto_id_idx" ON "payload_locked_documents_rels" USING btree ("tipi_effetto_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "tipi_effetto" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "tipi_effetto" CASCADE;
  ALTER TABLE "effetti" DROP CONSTRAINT IF EXISTS "effetti_tipo_personalizzato_id_tipi_effetto_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_tipi_effetto_fk";
  
  ALTER TABLE "effetti" ALTER COLUMN "tipo" SET DATA TYPE text;
  -- Il vecchio elenco non ha "personalizzato": diventano pulsazioni spente
  UPDATE "effetti" SET "tipo" = 'pulsazione', "attivo" = false WHERE "tipo" = 'personalizzato';
  DROP TYPE "public"."enum_effetti_tipo";
  CREATE TYPE "public"."enum_effetti_tipo" AS ENUM('pulsazione', 'scarica', 'particelle', 'onde', 'bagliore');
  ALTER TABLE "effetti" ALTER COLUMN "tipo" SET DATA TYPE "public"."enum_effetti_tipo" USING "tipo"::"public"."enum_effetti_tipo";
  DROP INDEX "effetti_tipo_personalizzato_idx";
  DROP INDEX "payload_locked_documents_rels_tipi_effetto_id_idx";
  ALTER TABLE "effetti" DROP COLUMN "tipo_personalizzato_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "tipi_effetto_id";`)
}
