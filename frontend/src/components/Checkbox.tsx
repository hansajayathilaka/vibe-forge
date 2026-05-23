import type { ComponentRenderProps } from '@json-render/react'

interface CheckboxProps {
  label: string
  checked?: unknown
  onChange?: (value: boolean) => void
}

export function Checkbox(rawProps: ComponentRenderProps) {
  const { label, checked, onChange } = rawProps as unknown as CheckboxProps

  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={Boolean(checked)}
        onChange={(e) => onChange?.(e.target.checked)}
        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  )
}
