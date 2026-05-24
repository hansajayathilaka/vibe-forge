import { useData } from '@json-render/react'
import type { ComponentRenderProps } from '@json-render/react'
import type { Action } from '@json-render/core'
import type { UiActionDef } from '@shared/types/index.js'
import { useDataTableContext } from './DataTable.js'

interface DataTableRowProps {
  id?: unknown
  _actions?: Record<string, UiActionDef | UiActionDef[]>
  [key: string]: unknown
}

export function DataTableRow({ element, onAction }: ComponentRenderProps) {
  const { _actions, id, ...cellProps } = element.props as DataTableRowProps
  const { columns } = useDataTableContext()
  const { set } = useData()

  const handleClick = () => {
    if (id != null) set('/ui/tableSelectedId', id)
    const raw = _actions?.click
    const chain: UiActionDef[] = Array.isArray(raw) ? raw : raw ? [raw] : []
    for (const def of chain) {
      void onAction?.({ name: def.action, params: def.params } as Action)
    }
  }

  const hasClickHandler = Boolean(_actions?.click)

  return (
    <tr
      onClick={hasClickHandler ? handleClick : undefined}
      className={hasClickHandler ? 'cursor-pointer hover:bg-gray-50 transition-colors' : undefined}
    >
      {columns.map((col) => {
        const val = (cellProps as Record<string, unknown>)[col.key]
        return (
          <td key={col.key} className="px-4 py-3 text-gray-700 whitespace-nowrap">
            {val != null ? String(val) : '—'}
          </td>
        )
      })}
    </tr>
  )
}
