'use client'

import { Button, type ButtonProps } from '@/components/ui/button'
import { cn } from '@/utilities/ui'
import Link from 'next/link'
import React from 'react'

import type { Page, Post } from '@/payload-types'
import { useLingua } from '@/providers/Lingua'
import { percorsoDoc, urlNellaLingua } from '@/utilities/lingue'

type CMSLinkType = {
  appearance?: 'inline' | ButtonProps['variant']
  children?: React.ReactNode
  className?: string
  label?: string | null
  newTab?: boolean | null
  // Pagina o notizia ({ relationTo, value }); solo pagina nei pulsanti dell'hero (fields/link.ts)
  reference?:
    | {
        relationTo: 'pages' | 'posts'
        value: Page | Post | string | number
      }
    | Page
    | number
    | null
  size?: ButtonProps['size'] | null
  type?: 'custom' | 'reference' | null
  url?: string | null
}

export const CMSLink: React.FC<CMSLinkType> = (props) => {
  const {
    type,
    appearance = 'inline',
    children,
    className,
    label,
    newTab,
    reference,
    size: sizeFromProps,
    url,
  } = props

  const { lingua } = useLingua()
  const destinazione =
    reference && typeof reference === 'object' && 'relationTo' in reference
      ? reference
      : reference
        ? { relationTo: 'pages' as const, value: reference }
        : null
  // Pagine e notizie: indirizzo nella lingua della pagina (/en/therapy). Indirizzi scritti a mano
  // che iniziano con "/": prefisso della lingua, tranne file e indirizzi già con una lingua
  const href =
    type === 'reference' && typeof destinazione?.value === 'object' && destinazione.value.slug
      ? percorsoDoc(lingua, destinazione.value.slug, destinazione.relationTo)
      : url
        ? urlNellaLingua(lingua, url)
        : url

  if (!href) return null

  const size = appearance === 'link' ? 'clear' : sizeFromProps
  const newTabProps = newTab ? { rel: 'noopener noreferrer', target: '_blank' } : {}

  /* Ensure we don't break any styles set by richText */
  if (appearance === 'inline') {
    return (
      <Link className={cn(className)} href={href || url || ''} {...newTabProps}>
        {label && label}
        {children && children}
      </Link>
    )
  }

  return (
    <Button asChild className={className} size={size} variant={appearance}>
      <Link className={cn(className)} href={href || url || ''} {...newTabProps}>
        {label && label}
        {children && children}
      </Link>
    </Button>
  )
}
