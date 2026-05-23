import type { ComponentRenderProps } from '@json-render/react'
import { Children } from 'react'
import { cx } from './tailwind.js'

interface TabDef {
  id: string
  label: string
}

interface TabsProps {
  tabs: TabDef[]
  activeTab?: unknown
  onChange?: (id: string) => void
  onActiveTabChange?: (id: string) => void
  children?: React.ReactNode
}

export function Tabs(rawProps: ComponentRenderProps) {
  const { tabs = [], activeTab, onChange, onActiveTabChange, children } = rawProps as unknown as TabsProps

  const setTab = onChange ?? onActiveTabChange
  const active = activeTab != null ? String(activeTab) : (tabs[0]?.id ?? '')

  const childArray = Children.toArray(children)

  return (
    <div className="flex flex-col">
      <div className="flex border-b border-gray-200" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active === tab.id}
            type="button"
            onClick={() => setTab?.(tab.id)}
            className={cx(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors focus:outline-none',
              active === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="pt-4">
        {childArray.map((child, index) => {
          const tab = tabs[index]
          if (!tab) return null
          const isActive = active === tab.id
          return (
            <div
              key={tab.id}
              role="tabpanel"
              hidden={!isActive}
              className={isActive ? 'block' : 'hidden'}
            >
              {child}
            </div>
          )
        })}
      </div>
    </div>
  )
}
