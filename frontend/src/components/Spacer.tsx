import type { ComponentRenderProps } from '@json-render/react'

const SIZE_CLASS: Record<number, string> = {
  1: 'h-1 w-1', 2: 'h-2 w-2', 3: 'h-3 w-3', 4: 'h-4 w-4',
  5: 'h-5 w-5', 6: 'h-6 w-6', 8: 'h-8 w-8', 10: 'h-10 w-10',
  12: 'h-12 w-12', 16: 'h-16 w-16',
}

interface SpacerProps {
  size?: number
}

export function Spacer(rawProps: ComponentRenderProps) {
  const { size = 4 } = rawProps as SpacerProps
  return <div className={SIZE_CLASS[size] ?? 'h-4 w-4'} />
}
