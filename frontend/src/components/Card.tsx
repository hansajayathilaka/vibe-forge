import type { ComponentRenderProps } from '@json-render/react'
import { padClass, cx } from './tailwind.js'

interface CardProps {
  padding?: number | null
  children?: React.ReactNode
}

export function Card(rawProps: ComponentRenderProps) {
  const { padding, children } = rawProps as CardProps
  return (
    <div className={cx('bg-white border border-gray-200 rounded-lg shadow-sm', padClass(padding))}>
      {children}
    </div>
  )
}
