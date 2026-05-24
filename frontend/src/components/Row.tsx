import type { ComponentRenderProps } from '@json-render/react'
import { gapClass, padClass, alignClass, cx } from './tailwind.js'

interface RowProps {
  gap?: number | null
  padding?: number | null
  align?: 'start' | 'center' | 'end' | 'stretch' | null
  wrap?: boolean | null
}

export function Row({ element, children }: ComponentRenderProps) {
  const { gap, padding, align, wrap } = element.props as RowProps
  return (
    <div
      className={cx(
        'flex flex-row',
        gapClass(gap),
        padClass(padding),
        alignClass(align),
        wrap ? 'flex-wrap' : undefined,
      )}
    >
      {children}
    </div>
  )
}
