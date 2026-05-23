import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  DataProvider,
  VisibilityProvider,
  ActionProvider,
  Renderer,
  useData,
  useActions,
} from '@json-render/react'
import type { UITree, UIElement, VisibilityCondition } from '@json-render/core'
import type { UiScreen, ScreenSpec, UiElementSpec } from '@shared/types/index.js'
import { configSource } from '../config/index.js'
import { componentRegistry } from './registry.js'
import { triggerDataCall, type StateStore } from './triggerDataCall.js'
import { interpolateTemplate } from './interpolateTemplate.js'

interface ScreenRendererProps {
  screenId: string
}

export function ScreenRenderer({ screenId }: ScreenRendererProps) {
  const navigate = useNavigate()
  const routeParams = useParams()

  const [screen, setScreen] = useState<UiScreen | null>(null)
  const [loadingScreen, setLoadingScreen] = useState(true)
  const [screenError, setScreenError] = useState<string | null>(null)

  useEffect(() => {
    setLoadingScreen(true)
    setScreenError(null)
    configSource
      .getScreen(screenId)
      .then(s => {
        setScreen(s)
        setLoadingScreen(false)
      })
      .catch((err: unknown) => {
        setScreenError(err instanceof Error ? err.message : String(err))
        setLoadingScreen(false)
      })
  }, [screenId])

  if (loadingScreen) return <LoadingSkeleton />
  if (screenError) return <ScreenError message={screenError} />
  if (!screen) return null

  const initialData = buildInitialData(screen.spec.state ?? {}, routeParams)
  const tree = specToUITree(screen.spec)

  return (
    <DataProvider key={screen.id} initialData={initialData}>
      <VisibilityProvider>
        <ActionProvider navigate={navigate}>
          <InnerScreen screen={screen} tree={tree} />
        </ActionProvider>
      </VisibilityProvider>
    </DataProvider>
  )
}

interface InnerScreenProps {
  screen: UiScreen
  tree: UITree
}

function InnerScreen({ screen, tree }: InnerScreenProps) {
  const { get, set } = useData()
  const { registerHandler } = useActions()
  const navigate = useNavigate()

  // Refs keep handler closures always pointing to the latest store and navigate
  const storeRef = useRef<StateStore>({ get, set })
  storeRef.current = { get, set }

  const navigateRef = useRef(navigate)
  navigateRef.current = navigate

  const screenRef = useRef(screen)
  screenRef.current = screen

  // Register action handlers once; they read from refs at call time
  useEffect(() => {
    registerHandler('callData', async (params) => {
      await triggerDataCall(
        String(params['name']),
        storeRef.current,
        screenRef.current.data ?? [],
      )
    })

    registerHandler('navigate', (params) => {
      navigateRef.current(interpolateTemplate(String(params['to']), storeRef.current.get))
    })

    registerHandler('runBehaviour', async (params) => {
      const { loadBehaviour } = await import('../behaviour/BehaviourLoader.js')
      const mod = await loadBehaviour(String(params['file']))
      const fn = mod[String(params['fn'])]
      await fn({ model: storeRef.current, navigate: navigateRef.current })
    })
  }, [registerHandler])

  // Fire all trigger:"load" DataCalls in parallel on mount
  useEffect(() => {
    const loadCalls = (screenRef.current.data ?? []).filter(d => d.trigger === 'load')
    void Promise.all(
      loadCalls.map(d => triggerDataCall(d.name, storeRef.current, screenRef.current.data ?? [])),
    )
  }, []) // Intentional: DataProvider key resets when screen changes, so this mounts fresh

  return <Renderer tree={tree} registry={componentRegistry} />
}

function buildInitialData(
  stateSpec: Record<string, unknown>,
  routeParams: Readonly<Record<string, string | undefined>>,
): Record<string, unknown> {
  const params: Record<string, string> = {}
  for (const [key, value] of Object.entries(routeParams)) {
    if (value !== undefined) params[key] = value
  }
  return { ...stateSpec, route: { params } }
}

function specToUITree(spec: ScreenSpec): UITree {
  const elements: Record<string, UIElement> = {}

  for (const [id, el] of Object.entries(spec.elements)) {
    elements[id] = {
      key: id,
      type: el.type,
      props: buildElementProps(el),
      children: el.children,
      visible: convertShowIf(el.showIf),
    }
  }

  return { root: spec.root, elements }
}

function buildElementProps(el: UiElementSpec): Record<string, unknown> {
  const props: Record<string, unknown> = { ...el.props }
  if (el.actions !== undefined) props['_actions'] = el.actions
  if (el.repeat !== undefined) props['_repeat'] = el.repeat
  return props
}

function convertShowIf(showIf: unknown): VisibilityCondition | undefined {
  if (showIf === undefined || showIf === null) return undefined
  if (typeof showIf === 'boolean') return showIf
  if (typeof showIf === 'object') {
    const obj = showIf as Record<string, unknown>
    if ('$state' in obj && typeof obj['$state'] === 'string') {
      return { path: obj['$state'] }
    }
  }
  return undefined
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-56 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  )
}

function ScreenError({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md p-8 bg-white rounded-lg shadow border border-red-200">
        <p className="text-lg font-semibold text-red-700 mb-2">Failed to load screen</p>
        <p className="text-sm text-gray-600 font-mono break-all">{message}</p>
      </div>
    </div>
  )
}
