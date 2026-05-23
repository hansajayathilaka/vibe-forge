import type { ComponentRenderProps } from '@json-render/react'
import { cx } from './tailwind.js'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'

const VARIANT_CLASS: Record<Variant, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 border-transparent',
  secondary: 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300',
  danger: 'bg-red-600 text-white hover:bg-red-700 border-transparent',
  ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 border-transparent',
}

interface ButtonProps {
  label: string
  variant?: Variant | null
  disabled?: unknown
  loading?: unknown
  onClick?: () => void
}

export function Button(rawProps: ComponentRenderProps) {
  const { label, variant = 'primary', disabled, loading, onClick } = rawProps as unknown as ButtonProps
  const v = (variant ?? 'primary') as Variant
  const isDisabled = Boolean(disabled) || Boolean(loading)

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      className={cx(
        'inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        VARIANT_CLASS[v] ?? VARIANT_CLASS.primary,
        isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
      )}
    >
      {Boolean(loading) && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      )}
      {label}
    </button>
  )
}
