import type { ComponentRenderProps } from '@json-render/react'
import type { Action } from '@json-render/core'
import { cx, elemCls } from './tailwind.js'
import type { UiActionDef } from '@shared/types/index.js'

interface FormProps {
  _actions?: Record<string, UiActionDef | UiActionDef[]>
}

export function Form({ element, children, onAction }: ComponentRenderProps) {
  const { _actions } = element.props as FormProps

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const raw = _actions?.submit
    const chain: UiActionDef[] = Array.isArray(raw) ? raw : raw ? [raw] : []
    for (const def of chain) {
      void onAction?.({ name: def.action, params: def.params } as Action)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cx('flex flex-col gap-4', elemCls(element))}>
      {children}
    </form>
  )
}
