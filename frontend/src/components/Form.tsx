import type { ComponentRenderProps } from '@json-render/react'

interface FormProps {
  onSubmit?: () => void
  children?: React.ReactNode
}

export function Form(rawProps: ComponentRenderProps) {
  const { onSubmit, children } = rawProps as FormProps
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit?.()
      }}
      className="flex flex-col gap-4"
    >
      {children}
    </form>
  )
}
