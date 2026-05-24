import { createContext, useContext } from 'react'
import type { ComponentRenderProps } from '@json-render/react'

export interface DataTableColumn {
  key: string
  label: string
  format?: string
}

interface DataTableContextValue {
  columns: DataTableColumn[]
}

export const DataTableContext = createContext<DataTableContextValue>({ columns: [] })

export function useDataTableContext(): DataTableContextValue {
  return useContext(DataTableContext)
}

interface DataTableProps {
  columns?: DataTableColumn[]
  emptyMessage?: string | null
}

export function DataTable({ element, children }: ComponentRenderProps) {
  const { columns = [], emptyMessage = 'No records found.' } = element.props as DataTableProps

  return (
    <DataTableContext.Provider value={{ columns }}>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {children ?? (
              <tr>
                <td
                  colSpan={columns.length || 1}
                  className="px-4 py-8 text-center text-gray-400"
                >
                  {emptyMessage ?? 'No records found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </DataTableContext.Provider>
  )
}
