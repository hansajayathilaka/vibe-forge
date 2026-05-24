import type { ComponentRenderProps } from '@json-render/react'
import type { Action } from '@json-render/core'
import type { UiActionDef } from '@shared/types/index.js'
import { cx, elemCls } from './tailwind.js'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'

const VARIANT_CLASS: Record<Variant, string> = {
  primary: 'bg-vf-primary text-vf-primary-text hover:bg-vf-primary-hover border-transparent',
  secondary: 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300',
  danger: 'bg-vf-danger text-vf-danger-text hover:bg-vf-danger-hover border-transparent',
  ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 border-transparent',
}

interface ButtonProps {
  label: string
  variant?: Variant | null
  disabled?: unknown
  loading?: unknown
  _actions?: Record<string, UiActionDef | UiActionDef[]>
}

export function Button({ element, onAction }: ComponentRenderProps) {
  const { label, variant = 'primary', disabled, loading, _actions } = element.props as unknown as ButtonProps
  const v = (variant ?? 'primary') as Variant
  const isDisabled = Boolean(disabled) || Boolean(loading)

  const handleClick = () => {
    const raw = _actions?.click
    const chain: UiActionDef[] = Array.isArray(raw) ? raw : raw ? [raw] : []
    for (const def of chain) {
      void onAction?.({ name: def.action, params: def.params } as Action)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isDisabled}
      className={cx(
        'inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-vf-sm border transition-colors focus:outline-none focus:ring-2 focus:ring-vf-primary focus:ring-offset-2',
        VARIANT_CLASS[v] ?? VARIANT_CLASS.primary,
        isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        elemCls(element),
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
