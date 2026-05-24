import type { ComponentRenderProps } from '@json-render/react'
import { useData } from '@json-render/react'

type BadgeColor = 'green' | 'yellow' | 'red' | 'blue' | 'gray'

const COLOR_CLASS: Record<BadgeColor, string> = {
  green: 'bg-green-100 text-green-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  red: 'bg-red-100 text-red-800',
  blue: 'bg-blue-100 text-blue-800',
  gray: 'bg-gray-100 text-gray-700',
}

interface BadgeProps {
  label?: unknown
  color?: BadgeColor | null
}

export function Badge({ element }: ComponentRenderProps) {
  const { get } = useData()
  const { label: rawLabel, color = 'gray' } = element.props as BadgeProps

  let label: unknown = rawLabel
  if (rawLabel !== null && typeof rawLabel === 'object' && '$state' in rawLabel) {
    label = get((rawLabel as { '$state': string })['$state'])
  }

  const c = (color ?? 'gray') as BadgeColor
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${COLOR_CLASS[c] ?? COLOR_CLASS.gray}`}
    >
      {String(label ?? '')}
    </span>
  )
}
