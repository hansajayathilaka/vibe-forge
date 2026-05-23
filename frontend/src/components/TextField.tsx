import type { ComponentRenderProps } from '@json-render/react'

type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'

interface TextFieldProps {
  label: string
  value?: unknown
  placeholder?: string | null
  required?: boolean | null
  type?: InputType | null
  onChange?: (value: string) => void
}

export function TextField(rawProps: ComponentRenderProps) {
  const { label, value, placeholder, required, type = 'text', onChange } = rawProps as unknown as TextFieldProps

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type={(type ?? 'text') as InputType}
        value={value != null ? String(value) : ''}
        placeholder={placeholder ?? undefined}
        required={required ?? undefined}
        onChange={(e) => onChange?.(e.target.value)}
        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  )
}
