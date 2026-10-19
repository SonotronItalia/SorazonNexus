import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { ImageResponse } from 'next/og'

import { SITE_NAME } from '@/utilities/mergeOpenGraph'

// Immagine di condivisione (Open Graph) 1200x630: logo Sorazon e titolo della pagina su fondo
// scuro, come l'hero. /og?titolo=Terapia. Usata quando una pagina non ha un'immagine SEO.
let logo: Promise<string | null> | undefined
const caricaLogo = () =>
  (logo ??= readFile(path.join(process.cwd(), 'public', 'logo_sorazon.svg'))
    .then((b) => `data:image/svg+xml;base64,${b.toString('base64')}`)
    .catch(() => null))

export async function GET(req: Request) {
  const titolo = (new URL(req.url).searchParams.get('titolo') ?? '').slice(0, 90)
  const src = await caricaLogo()

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '72px 88px',
          background: 'radial-gradient(circle at 75% 40%, #0e7490 0%, #0b1a3a 45%, #020617 100%)',
          color: 'white',
        }}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} width={420} height={127} alt="" />
        ) : (
          <div style={{ fontSize: 96, fontWeight: 700 }}>{SITE_NAME}</div>
        )}
        {titolo && (
          <div style={{ marginTop: 56, fontSize: 68, lineHeight: 1.1, maxWidth: 1000 }}>{titolo}</div>
        )}
        <div style={{ marginTop: titolo ? 32 : 48, fontSize: 30, color: '#a5f3fc' }}>
          Terapia antinfiammatoria non invasiva · Rete dei centri in Italia
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: { 'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800' },
    },
  )
}
