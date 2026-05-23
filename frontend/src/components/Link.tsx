import type { ComponentRenderProps } from '@json-render/react'
import { Link as RouterLink } from 'react-router-dom'

interface LinkProps {
  label: string
  to: string
  external?: boolean | null
}

export function Link(rawProps: ComponentRenderProps) {
  const { label, to, external } = rawProps as unknown as LinkProps
  const cls = 'text-blue-600 hover:text-blue-800 underline underline-offset-2 transition-colors'

  if (external) {
    return (
      <a href={to} target="_blank" rel="noopener noreferrer" className={cls}>
        {label}
      </a>
    )
  }

  return <RouterLink to={to} className={cls}>{label}</RouterLink>
}
