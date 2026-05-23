import type { ComponentRenderProps } from '@json-render/react'
import { gapClass, padClass, alignClass, cx } from './tailwind.js'

interface ColumnProps {
  gap?: number | null
  padding?: number | null
  align?: 'start' | 'center' | 'end' | 'stretch' | null
  children?: React.ReactNode
}

export function Column(rawProps: ComponentRenderProps) {
  const { gap, padding, align, children } = rawProps as ColumnProps
  return (
    <div className={cx('flex flex-col', gapClass(gap), padClass(padding), alignClass(align))}>
      {children}
    </div>
  )
}
