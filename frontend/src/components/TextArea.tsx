import { useId } from 'react'
import type { ComponentRenderProps } from '@json-render/react'
import { useDataBinding } from '@json-render/react'
import type { Action } from '@json-render/core'
import type { UiActionDef } from '@shared/types/index.js'
import { cx, elemCls } from './tailwind.js'

interface TextAreaProps {
  label: string
  value?: unknown
  rows?: number | null
  placeholder?: string | null
  _actions?: Record<string, UiActionDef | UiActionDef[]>
}

export function TextArea({ element, onAction }: ComponentRenderProps) {
  const id = useId()
  const { label, value: valueProp, rows = 4, placeholder, _actions } = element.props as unknown as TextAreaProps

  const bindPath = valueProp !== null && typeof valueProp === 'object' && '$bindState' in valueProp
    ? (valueProp as { '$bindState': string })['$bindState']
    : null

  const [boundValue, setBoundValue] = useDataBinding<string>(bindPath ?? '__no_bind')

  const displayValue = bindPath !== null ? (boundValue ?? '') : String(valueProp ?? '')

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (bindPath !== null) setBoundValue(e.target.value)
    const raw = _actions?.change
    const chain: UiActionDef[] = Array.isArray(raw) ? raw : raw ? [raw] : []
    for (const def of chain) {
      void onAction?.({ name: def.action, params: def.params } as Action)
    }
  }

  return (
    <div className={cx('flex flex-col gap-1', elemCls(element))}>
      <label htmlFor={id} className="text-sm font-medium text-gray-700">{label}</label>
      <textarea
        id={id}
        value={displayValue}
        rows={rows ?? 4}
        placeholder={placeholder ?? undefined}
        onChange={handleChange}
        className="block w-full rounded-vf-sm border border-vf-input-border px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-vf-input-ring focus:border-vf-input-ring resize-y"
      />
    </div>
  )
}
