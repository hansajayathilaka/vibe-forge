import type { ComponentRenderProps } from '@json-render/react'
import { gapClass, cx, elemCls } from './tailwind.js'

const COLS: Record<number, string> = {
  1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4',
  5: 'grid-cols-5', 6: 'grid-cols-6', 12: 'grid-cols-12',
}

interface GridProps {
  cols?: number | null
  gap?: number | null
}

export function Grid({ element, children }: ComponentRenderProps) {
  const { cols, gap } = element.props as GridProps
  const colClass = cols != null ? (COLS[cols] ?? '') : ''
  return (
    <div className={cx('grid', colClass, gapClass(gap), elemCls(element))}>
      {children}
    </div>
  )
}
