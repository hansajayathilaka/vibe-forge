import type { ComponentRenderProps } from '@json-render/react'

interface SelectOption {
  label: string
  value: string
}

interface SelectProps {
  label: string
  value?: unknown
  options?: unknown
  onChange?: (value: string) => void
}

export function Select(rawProps: ComponentRenderProps) {
  const { label, value, options, onChange } = rawProps as unknown as SelectProps

  const opts = Array.isArray(options)
    ? (options as SelectOption[])
    : []

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <select
        value={value != null ? String(value) : ''}
        onChange={(e) => onChange?.(e.target.value)}
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
