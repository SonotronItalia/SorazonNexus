#!/usr/bin/env bash
# Divide vetrina/ in backend/ (solo Payload) e frontend/ (solo Next.js).
# COPIA, non sposta: vetrina/ resta intatta finché non la togli tu.
set -euo pipefail
cd "$(dirname "$0")/.."

[ -d vetrina/src ] || { echo "Non trovo vetrina/src: lancia lo script dalla radice del progetto"; exit 1; }
[ -d kit ] || { echo "Manca la cartella kit/ (decomprimi prima lo zip nella radice)"; exit 1; }
if [ -e backend ] || [ -e frontend ]; then
  echo "backend/ o frontend/ esistono già: spostali e rilancia"; exit 1
fi
command -v node  >/dev/null 2>&1 || { echo "Serve node"; exit 1; }

# Copia con tar (c'è su macOS e Linux), escludendo ciò che non va portato
copy_to() {
  mkdir -p "$1"
  tar -C vetrina \
    --exclude=./node_modules --exclude=./.next --exclude=./.env --exclude=./.env.local \
    --exclude=./LICENSE --exclude=./txt.txt --exclude=./docker-compose.yml --exclude=./Dockerfile \
    -cf - . | tar -C "$1" -xf -
}
copy_to backend
copy_to frontend

# ------------------------------------------------------------- BACKEND: solo Payload
B=backend/src
rm -rf "$B/app/(frontend)" "$B/components" "$B/providers" "$B/endpoints" "$B/cssVariables.js" \
       "$B/search/Component.tsx" \
       "$B/Header/Component.client.tsx" "$B/Header/Component.tsx" "$B/Header/Nav" \
       "$B/Footer/Component.tsx"
# blocchi e hero: nel backend restano SOLO le configurazioni dei campi
find "$B/blocks" -type f ! -name config.ts -delete
find "$B/heros"  -type f ! -name config.ts -delete
find "$B/blocks" "$B/heros" -type d -empty -delete
( cd "$B/utilities" && rm -f formatAuthors.ts formatDateTime.ts generateMeta.ts getDocument.ts \
    getGlobals.ts getMediaUrl.ts getMeUser.ts getRedirects.ts mergeOpenGraph.ts ui.ts \
    useClickableCard.ts useDebounce.ts )
rm -rf backend/tests/e2e backend/tests/helpers backend/playwright.config.ts backend/tailwind.config.mjs \
       backend/postcss.config.js backend/components.json backend/next-sitemap.config.cjs backend/redirects.ts
rm -rf backend/public && mkdir -p backend/public && touch backend/public/.gitkeep

# ------------------------------------------------------------- FRONTEND: solo Next.js
F=frontend/src
rm -rf "$F/app/(payload)" "$F/app/(frontend)/next" \
       "$F/collections" "$F/access" "$F/hooks" "$F/plugins" "$F/endpoints" "$F/fields" "$F/payload.config.ts" \
       "$F/search/beforeSync.ts" "$F/search/fieldOverrides.ts" \
       "$F/Header/config.ts" "$F/Header/hooks" "$F/Header/RowLabel.tsx" \
       "$F/Footer/config.ts" "$F/Footer/hooks" "$F/Footer/RowLabel.tsx" \
       "$F/heros/config.ts" \
       "$F/components/BeforeDashboard" "$F/components/BeforeLogin" "$F/components/AdminBar" \
       "$F/utilities/generatePreviewPath.ts" "$F/utilities/getMeUser.ts"
find "$F/blocks" -name config.ts -delete
rm -rf frontend/tests frontend/vitest.config.mts frontend/vitest.setup.ts frontend/playwright.config.ts frontend/test.env

# ------------------------------------------------------------- file nuovi del kit
cp -R kit/backend/.  backend/
cp -R kit/frontend/. frontend/

# ------------------------------------------------------------- package.json
node - << 'JS'
const fs = require('fs')
const edit = (file, fn) => {
  const p = JSON.parse(fs.readFileSync(file, 'utf8'))
  fn(p)
  fs.writeFileSync(file, JSON.stringify(p, null, 2) + '\n')
}
const rm = (p, names) => {
  for (const sec of ['dependencies', 'devDependencies'])
    for (const n of names) if (p[sec]) delete p[sec][n]
}
const dropScripts = (p, names) => { for (const n of names) delete p.scripts[n] }

edit('backend/package.json', (p) => {
  p.name = 'sorazon-backend'
  rm(p, ['@payloadcms/admin-bar', '@payloadcms/live-preview-react', 'lucide-react', 'react-hook-form',
    '@radix-ui/react-checkbox', '@radix-ui/react-label', '@radix-ui/react-select', '@radix-ui/react-slot',
    'class-variance-authority', 'clsx', 'tailwind-merge', 'tailwindcss', '@tailwindcss/postcss',
    '@tailwindcss/typography', 'tw-animate-css', 'postcss', 'autoprefixer', 'geist', 'prism-react-renderer',
    'next-sitemap', '@playwright/test', '@testing-library/react'])
  dropScripts(p, ['postbuild', 'test', 'test:e2e', 'dev:prod'])
  p.scripts.dev = 'cross-env NODE_OPTIONS=--no-deprecation next dev -p 3001'
  p.scripts.start = 'cross-env NODE_OPTIONS=--no-deprecation next start -p 3001'
})

edit('frontend/package.json', (p) => {
  p.name = 'sorazon-frontend'
  // Restano payload, richtext-lexical, ui e next: servono al convertitore del rich text e ai tipi.
  // Da snellire in un passaggio dedicato, dopo che tutto funziona.
  rm(p, ['@payloadcms/db-postgres', '@payloadcms/plugin-form-builder', '@payloadcms/plugin-nested-docs',
    '@payloadcms/plugin-redirects', '@payloadcms/plugin-search', '@payloadcms/plugin-seo',
    '@payloadcms/admin-bar', 'dotenv', 'tsx', '@playwright/test', '@testing-library/react',
    '@vitejs/plugin-react', 'jsdom', 'vite-tsconfig-paths', 'vitest'])
  dropScripts(p, ['generate:importmap', 'generate:types', 'payload', 'test', 'test:e2e', 'test:int', 'dev:prod'])
})
JS

# La cartella kit/ ha finito il suo lavoro
rm -rf kit

echo
echo "Fatto. backend/ e frontend/ creati. vetrina/ è rimasta com'era."
echo "Prossimi passi: vedi il messaggio con le modifiche manuali al backend."
