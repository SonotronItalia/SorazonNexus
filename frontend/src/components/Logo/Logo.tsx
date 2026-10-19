import React from 'react'

interface Props {
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
}

export const Logo = (props: Props) => {
  const { loading: loadingFromProps, priority: priorityFromProps } = props

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
      className="max-w-[21rem] w-full h-[76px] object-contain [filter:none!important]"
      src="/logo_sorazon.svg"
    />
  )
}
