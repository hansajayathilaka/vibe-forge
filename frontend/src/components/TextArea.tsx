import type { ComponentRenderProps } from '@json-render/react'

interface TextAreaProps {
  label: string
  value?: unknown
  rows?: number
  onChange?: (value: string) => void
}

export function TextArea(rawProps: ComponentRenderProps) {
  const { label, value, rows = 4, onChange } = rawProps as unknown as TextAreaProps

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <textarea
        value={value != null ? String(value) : ''}
        rows={rows}
        onChange={(e) => onChange?.(e.target.value)}
        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
      />
    </div>
  )
}
