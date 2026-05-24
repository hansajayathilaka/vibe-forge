import type { ComponentRenderProps } from '@json-render/react'
import { useData } from '@json-render/react'
import { elemCls } from './tailwind.js'

type Variant = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'caption'

const VARIANT_CLASS: Record<Variant, string> = {
  h1: 'text-4xl font-bold text-gray-900',
  h2: 'text-3xl font-semibold text-gray-900',
  h3: 'text-2xl font-semibold text-gray-800',
  h4: 'text-xl font-medium text-gray-800',
  h5: 'text-lg font-medium text-gray-700',
  h6: 'text-base font-medium text-gray-700',
  body: 'text-base text-gray-700',
  caption: 'text-sm text-gray-500',
}

interface TextProps {
  text?: unknown
  variant?: Variant | null
  color?: string | null
}

export function Text({ element }: ComponentRenderProps) {
  const { get } = useData()
  const { text: rawText, variant = 'body', color } = element.props as TextProps

  let text: unknown = rawText
  if (rawText !== null && typeof rawText === 'object' && '$state' in rawText) {
    text = get((rawText as { '$state': string })['$state'])
  }

  const v = (variant ?? 'body') as Variant
  const cls = VARIANT_CLASS[v] ?? VARIANT_CLASS.body
  const tag = v.startsWith('h') ? v : 'p'
  const style = color ? { color } : undefined
  const extra = elemCls(element)
  const props = { className: extra ? `${cls} ${extra}` : cls, style, children: String(text ?? '') }
  return tag === 'h1' ? <h1 {...props} />
    : tag === 'h2' ? <h2 {...props} />
    : tag === 'h3' ? <h3 {...props} />
    : tag === 'h4' ? <h4 {...props} />
    : tag === 'h5' ? <h5 {...props} />
    : tag === 'h6' ? <h6 {...props} />
    : <p {...props} />
}
