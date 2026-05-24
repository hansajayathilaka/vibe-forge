import { useId } from 'react'
import type { ComponentRenderProps } from '@json-render/react'
import { useDataBinding } from '@json-render/react'
import type { Action } from '@json-render/core'
import type { UiActionDef } from '@shared/types/index.js'

type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'

interface TextFieldProps {
  label: string
  value?: unknown
  placeholder?: string | null
  required?: boolean | null
  type?: InputType | null
  _actions?: Record<string, UiActionDef | UiActionDef[]>
}

export function TextField({ element, onAction }: ComponentRenderProps) {
  const id = useId()
  const { label, value: valueProp, placeholder, required, type = 'text', _actions } = element.props as unknown as TextFieldProps

  const bindPath = valueProp !== null && typeof valueProp === 'object' && '$bindState' in valueProp
    ? (valueProp as { '$bindState': string })['$bindState']
    : null

  const [boundValue, setBoundValue] = useDataBinding<string>(bindPath ?? '__no_bind')

  const displayValue = bindPath !== null ? (boundValue ?? '') : String(valueProp ?? '')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (bindPath !== null) setBoundValue(e.target.value)

    const raw = _actions?.change
    const chain: UiActionDef[] = Array.isArray(raw) ? raw : raw ? [raw] : []
    for (const def of chain) {
      void onAction?.({ name: def.action, params: def.params } as Action)
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        id={id}
        type={(type ?? 'text') as InputType}
        value={displayValue}
        placeholder={placeholder ?? undefined}
        required={required ?? undefined}
        onChange={handleChange}
        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  )
}
