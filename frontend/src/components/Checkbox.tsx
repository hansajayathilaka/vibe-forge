import type { ComponentRenderProps } from '@json-render/react'
import { useDataBinding } from '@json-render/react'
import type { Action } from '@json-render/core'
import type { UiActionDef } from '@shared/types/index.js'

interface CheckboxProps {
  label: string
  checked?: unknown
  _actions?: Record<string, UiActionDef | UiActionDef[]>
}

export function Checkbox({ element, onAction }: ComponentRenderProps) {
  const { label, checked: checkedProp, _actions } = element.props as unknown as CheckboxProps

  const bindPath = checkedProp !== null && typeof checkedProp === 'object' && '$bindState' in checkedProp
    ? (checkedProp as { '$bindState': string })['$bindState']
    : null

  const [boundValue, setBoundValue] = useDataBinding<boolean>(bindPath ?? '__no_bind')

  const isChecked = bindPath !== null ? Boolean(boundValue) : Boolean(checkedProp)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (bindPath !== null) setBoundValue(e.target.checked)
    const raw = _actions?.change
    const chain: UiActionDef[] = Array.isArray(raw) ? raw : raw ? [raw] : []
    for (const def of chain) {
      void onAction?.({ name: def.action, params: def.params } as Action)
    }
  }

  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={isChecked}
        onChange={handleChange}
        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  )
}
