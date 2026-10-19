import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "effetti" ALTER COLUMN "posizione" SET DATA TYPE text;
  -- Punto di partenza da 3 a 9 posizioni: i vecchi valori diventano la riga centrale
  UPDATE "effetti" SET "posizione" = CASE "posizione"
    WHEN 'sinistra' THEN 'centro-sinistra'
    WHEN 'centro' THEN 'centro-centro'
    WHEN 'destra' THEN 'centro-destra'
    ELSE "posizione" END;
  ALTER TABLE "effetti" ALTER COLUMN "posizione" SET DEFAULT 'centro-destra'::text;
  DROP TYPE "public"."enum_effetti_posizione";
  CREATE TYPE "public"."enum_effetti_posizione" AS ENUM('alto-sinistra', 'alto-centro', 'alto-destra', 'centro-sinistra', 'centro-centro', 'centro-destra', 'basso-sinistra', 'basso-centro', 'basso-destra');
  ALTER TABLE "effetti" ALTER COLUMN "posizione" SET DEFAULT 'centro-destra'::"public"."enum_effetti_posizione";
  ALTER TABLE "effetti" ALTER COLUMN "posizione" SET DATA TYPE "public"."enum_effetti_posizione" USING "posizione"::"public"."enum_effetti_posizione";
  ALTER TABLE "tipi_effetto" ALTER COLUMN "javascript" SET DEFAULT '// Disegna sul canvas "effetto". Parametri in window.EFFETTO:
  //   colore ("#rrggbb"), intensita (0.5 / 1 / 1.4), velocita (0.6 / 1 / 1.5), puntoX e puntoY (0-1)
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
  ';
  ALTER TABLE "pages" ADD COLUMN "hero_bordo_immagine" boolean DEFAULT true;
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_bordo_immagine" boolean DEFAULT true;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "effetti" ALTER COLUMN "posizione" SET DATA TYPE text;
  -- Ritorno a 3 posizioni: resta solo la colonna (es. "alto-sinistra" -> "sinistra")
  UPDATE "effetti" SET "posizione" = split_part("posizione", '-', 2) WHERE "posizione" LIKE '%-%';
  ALTER TABLE "effetti" ALTER COLUMN "posizione" SET DEFAULT 'destra'::text;
  DROP TYPE "public"."enum_effetti_posizione";
  CREATE TYPE "public"."enum_effetti_posizione" AS ENUM('sinistra', 'centro', 'destra');
  ALTER TABLE "effetti" ALTER COLUMN "posizione" SET DEFAULT 'destra'::"public"."enum_effetti_posizione";
  ALTER TABLE "effetti" ALTER COLUMN "posizione" SET DATA TYPE "public"."enum_effetti_posizione" USING "posizione"::"public"."enum_effetti_posizione";
  ALTER TABLE "tipi_effetto" ALTER COLUMN "javascript" SET DEFAULT '// Disegna sul canvas "effetto". Parametri in window.EFFETTO:
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
  ';
  ALTER TABLE "pages" DROP COLUMN "hero_bordo_immagine";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_bordo_immagine";`)
}
