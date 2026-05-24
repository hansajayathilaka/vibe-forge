import type { ComponentRenderProps } from '@json-render/react'
import { Link as RouterLink } from 'react-router-dom'
import { cx, elemCls } from './tailwind.js'

interface LinkProps {
  label: string
  to: string
  external?: boolean | null
}

export function Link({ element }: ComponentRenderProps) {
  const { label, to, external } = element.props as unknown as LinkProps
  const cls = cx('text-vf-primary hover:text-vf-primary-hover underline underline-offset-2 transition-colors', elemCls(element))

  if (external) {
    return (
      <a href={to} target="_blank" rel="noopener noreferrer" className={cls}>
        {label}
      </a>
    )
  }

  return <RouterLink to={to} className={cls}>{label}</RouterLink>
}
