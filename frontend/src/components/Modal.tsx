import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { ComponentRenderProps } from '@json-render/react'
import { elemCls } from './tailwind.js'

interface ModalProps {
  title: string
}

export function Modal({ element, children }: ComponentRenderProps) {
  const { title } = element.props as unknown as ModalProps

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        document.dispatchEvent(new CustomEvent('vf:modal-escape'))
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="absolute inset-0 bg-black bg-opacity-40" />
      <div className={`relative bg-vf-surface rounded-vf shadow-xl max-w-lg w-full mx-4 overflow-hidden ${elemCls(element) ?? ''}`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-vf-surface-border">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        </div>
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>,
    document.body,
  )
}
