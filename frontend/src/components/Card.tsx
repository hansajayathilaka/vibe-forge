import type { ComponentRenderProps } from '@json-render/react'
import { padClass, cx, elemCls } from './tailwind.js'

interface CardProps {
  padding?: number | null
}

export function Card({ element, children }: ComponentRenderProps) {
  const { padding } = element.props as CardProps
  return (
    <div className={cx('bg-vf-surface border border-vf-surface-border rounded-vf shadow-sm', padClass(padding), elemCls(element))}>
      {children}
    </div>
  )
}
