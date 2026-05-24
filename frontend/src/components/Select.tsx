import { useId } from 'react'
import type { ComponentRenderProps } from '@json-render/react'
import { useDataBinding } from '@json-render/react'
import type { Action } from '@json-render/core'
import type { UiActionDef } from '@shared/types/index.js'

interface SelectOption {
  label: string
  value: string
}

interface SelectProps {
  label: string
  value?: unknown
  options?: unknown
  _actions?: Record<string, UiActionDef | UiActionDef[]>
}

export function Select({ element, onAction }: ComponentRenderProps) {
  const id = useId()
  const { label, value: valueProp, options, _actions } = element.props as unknown as SelectProps

  const bindPath = valueProp !== null && typeof valueProp === 'object' && '$bindState' in valueProp
    ? (valueProp as { '$bindState': string })['$bindState']
    : null

  const [boundValue, setBoundValue] = useDataBinding<string>(bindPath ?? '__no_bind')

  const displayValue = bindPath !== null ? (boundValue ?? '') : String(valueProp ?? '')

  const opts = Array.isArray(options) ? (options as SelectOption[]) : []

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (bindPath !== null) setBoundValue(e.target.value)
    const raw = _actions?.change
    const chain: UiActionDef[] = Array.isArray(raw) ? raw : raw ? [raw] : []
    for (const def of chain) {
      void onAction?.({ name: def.action, params: def.params } as Action)
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">{label}</label>
      <select
        id={id}
        value={displayValue}
        onChange={handleChange}
        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
      >
        <option value="">— select —</option>
        {opts.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
