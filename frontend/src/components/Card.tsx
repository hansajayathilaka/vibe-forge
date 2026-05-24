import type { ComponentRenderProps } from '@json-render/react'
import { padClass, cx } from './tailwind.js'

interface CardProps {
  padding?: number | null
}

export function Card({ element, children }: ComponentRenderProps) {
  const { padding } = element.props as CardProps
  return (
    <div className={cx('bg-white border border-gray-200 rounded-lg shadow-sm', padClass(padding))}>
      {children}
    </div>
  )
}
