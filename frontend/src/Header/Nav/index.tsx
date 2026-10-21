'use client'

import React from 'react'
import { useLingua } from '@/providers/Lingua'
import { LINGUA_PRINCIPALE } from '@/utilities/lingue'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import Link from 'next/link'
import { SearchIcon } from 'lucide-react'

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = data?.navItems || []
  const { lingua, t } = useLingua()

  return (
    <nav className="flex gap-3 items-center">
      {navItems.map(({ link }, i) => {
        return <CMSLink key={i} {...link} appearance="link" />
      })}
      {/* La ricerca cerca nelle notizie in italiano */}
      {lingua === LINGUA_PRINCIPALE && (
        <Link href="/search">
          <span className="sr-only">{t.cerca}</span>
          <SearchIcon className="w-5 text-primary" />
        </Link>
      )}
    </nav>
  )
}
