import type { ComponentRenderProps } from '@json-render/react'
import { useDataTableContext } from './DataTable.js'

interface DataTableRowProps {
  onClick?: () => void
  [key: string]: unknown
}

export function DataTableRow(rawProps: ComponentRenderProps) {
  const { onClick, ...cellProps } = rawProps as unknown as DataTableRowProps
  const { columns, onRowClick } = useDataTableContext()

  const handleClick = onClick ?? onRowClick

  return (
    <tr
      onClick={handleClick}
      className={handleClick ? 'cursor-pointer hover:bg-gray-50 transition-colors' : undefined}
    >
      {columns.map((col) => {
        const val = cellProps[col.key]
        return (
          <td key={col.key} className="px-4 py-3 text-gray-700 whitespace-nowrap">
            {val != null ? String(val) : '—'}
          </td>
        )
      })}
    </tr>
  )
}
