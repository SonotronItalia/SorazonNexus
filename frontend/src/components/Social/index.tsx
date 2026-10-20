import { Linkedin } from 'lucide-react'
import React from 'react'
import {
  siFacebook,
  siInstagram,
  siPinterest,
  siTelegram,
  siThreads,
  siTiktok,
  siWhatsapp,
  siX,
  siYoutube,
  type SimpleIcon,
} from 'simple-icons'

import type { Impostazioni } from '@/payload-types'
import { cn } from '@/utilities/ui'

type Profilo = NonNullable<Impostazioni['social']>[number]

// Loghi ufficiali dei marchi (Simple Icons, licenza CC0). LinkedIn non è in Simple Icons
// (rimosso su richiesta del marchio): si usa l'icona di lucide-react.
const LOGHI: Record<Exclude<Profilo['piattaforma'], 'linkedin'>, SimpleIcon> = {
  facebook: siFacebook,
  instagram: siInstagram,
  youtube: siYoutube,
  x: siX,
  tiktok: siTiktok,
  whatsapp: siWhatsapp,
  threads: siThreads,
  telegram: siTelegram,
  pinterest: siPinterest,
}

const NOMI: Record<Profilo['piattaforma'], string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
  x: 'X',
  tiktok: 'TikTok',
  whatsapp: 'WhatsApp',
  threads: 'Threads',
  telegram: 'Telegram',
  pinterest: 'Pinterest',
}

const Logo: React.FC<{ piattaforma: Profilo['piattaforma'] }> = ({ piattaforma }) => {
  if (piattaforma === 'linkedin') return <Linkedin className="h-5 w-5" aria-hidden />
  const logo = LOGHI[piattaforma]
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d={logo.path} />
    </svg>
  )
}

/**
 * Profili social con il logo della piattaforma, nel colore del testo (monocromatico, come
 * ammesso dalle linee guida dei marchi). Si aprono in una nuova scheda.
 */
export const Social: React.FC<{ profili?: Impostazioni['social']; className?: string }> = ({
  profili,
  className,
}) => {
  const validi = (profili ?? []).filter((p) => p.piattaforma in NOMI && /^https:\/\//i.test(p.url))
  if (validi.length === 0) return null
  return (
    <ul className={cn('flex flex-wrap items-center gap-4', className)}>
      {validi.map((p) => (
        <li key={p.id ?? p.url}>
          <a
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Sorazon su ${NOMI[p.piattaforma]} (si apre in una nuova scheda)`}
            className="inline-flex opacity-80 transition-opacity hover:opacity-100"
          >
            <Logo piattaforma={p.piattaforma} />
          </a>
        </li>
      ))}
    </ul>
  )
}
