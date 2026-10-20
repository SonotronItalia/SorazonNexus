import React from 'react'

interface Props {
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
  /** Altezza (classe Tailwind scritta per intero), es. "h-[44px]" nell'header compatto */
  altezza?: string
}

export const Logo = (props: Props) => {
  const { loading: loadingFromProps, priority: priorityFromProps, altezza = 'h-[76px]' } = props

  const loading = loadingFromProps || 'lazy'
  const priority = priorityFromProps || 'low'

  return (
    /* eslint-disable @next/next/no-img-element */
    <img
      alt="Sorazon Logo"
      width={336}
      height={76}
      loading={loading}
      fetchPriority={priority}
      decoding="async"
      style={{ filter: 'none !important', mixBlendMode: 'normal' }}
      className={`max-w-[21rem] w-full ${altezza} object-contain transition-[height] duration-300 [filter:none!important]`}
      src="/logo_sorazon.svg"
    />
  )
}
