import type { ComponentRenderProps } from '@json-render/react'
import { useData } from '@json-render/react'
import { Children } from 'react'
import type { Action } from '@json-render/core'
import type { UiActionDef } from '@shared/types/index.js'
import { cx } from './tailwind.js'

interface TabDef {
  id: string
  label: string
}

interface TabsProps {
  tabs: TabDef[]
  activeTab?: unknown
  _actions?: Record<string, UiActionDef | UiActionDef[]>
}

export function Tabs({ element, children, onAction }: ComponentRenderProps) {
  const { get } = useData()
  const { tabs = [], activeTab: activeTabRaw, _actions } = element.props as unknown as TabsProps

  let activeTabVal: unknown = activeTabRaw
  if (activeTabRaw !== null && typeof activeTabRaw === 'object' && '$state' in activeTabRaw) {
    activeTabVal = get((activeTabRaw as { '$state': string })['$state'])
  }

  const active = activeTabVal != null ? String(activeTabVal) : (tabs[0]?.id ?? '')

  const childArray = Children.toArray(children)

  const handleTabClick = (tabId: string) => {
    const raw = _actions?.tabChange
    const chain: UiActionDef[] = Array.isArray(raw) ? raw : raw ? [raw] : []
    for (const def of chain) {
      void onAction?.({ name: def.action, params: { ...def.params, tabId } } as Action)
    }
  }

  return (
    <div className="flex flex-col">
      <div className="flex border-b border-gray-200" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active === tab.id}
            type="button"
            onClick={() => handleTabClick(tab.id)}
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
