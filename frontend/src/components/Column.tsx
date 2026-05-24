import type { ComponentRenderProps } from '@json-render/react'
import { gapClass, padClass, alignClass, cx } from './tailwind.js'

interface ColumnProps {
  gap?: number | null
  padding?: number | null
  align?: 'start' | 'center' | 'end' | 'stretch' | null
}

export function Column({ element, children }: ComponentRenderProps) {
  const { gap, padding, align } = element.props as ColumnProps
  return (
    <div className={cx('flex flex-col', gapClass(gap), padClass(padding), alignClass(align))}>
      {children}
    </div>
  )
}
