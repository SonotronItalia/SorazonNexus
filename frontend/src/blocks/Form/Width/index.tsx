import * as React from 'react'

export const Width: React.FC<{
  children: React.ReactNode
  className?: string
  width?: number | string
}> = ({ children, className, width }) => {
  return (
    // La larghezza la applica il contenitore del campo in Component.tsx (affiancamento)
    <div className={className} data-larghezza={width}>
      {children}
    </div>
  )
}
