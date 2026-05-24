import type { DataCall } from '@shared/types/index.js'

export interface StateStore {
  get: (path: string) => unknown
  set: (path: string, value: unknown) => void
}

const PB_URL = (import.meta.env.VITE_PB_URL as string | undefined) ?? 'http://localhost:8090'

export async function triggerDataCall(
  name: string,
  store: StateStore,
  dataCalls: DataCall[],
): Promise<void> {
  const call = dataCalls.find(d => d.name === name)
  if (!call) throw new Error(`DataCall "${name}" not found`)

  store.set(`/data/${name}/_loading`, true)
  store.set(`/data/${name}/_error`, null)

  try {
    const result = await executeCall(call, store)
    if (call.action === 'list') {
      const list = result as { items: unknown[]; totalItems: number }
      store.set(`/data/${name}/items`, list.items)
      store.set(`/data/${name}/totalItems`, list.totalItems)
    } else {
      store.set(`/data/${name}`, result)
    }
  } catch (err) {
    store.set(`/data/${name}/_error`, err instanceof Error ? err.message : String(err))
  } finally {
    store.set(`/data/${name}/_loading`, false)
  }
}

async function executeCall(call: DataCall, store: StateStore): Promise<unknown> {
  const base = `${PB_URL}/api/collections/${call.collection}/records`

  if (call.action === 'list') {
    const params = new URLSearchParams()
    if (call.filter) params.set('filter', applyFilterSubstitution(call.filter, store))
    if (call.sort) params.set('sort', call.sort)
    if (call.expand) params.set('expand', call.expand)
    return fetchJson(`${base}?${params.toString()}`)
  }

  if (call.action === 'get') {
    const id = resolveId(call.id, store)
    const params = new URLSearchParams()
    if (call.expand) params.set('expand', call.expand)
    return fetchJson(`${base}/${id}?${params.toString()}`)
  }

  if (call.action === 'create') {
    return fetchJson(base, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resolveBody(call.body ?? {}, store)),
    })
  }

  if (call.action === 'update') {
    const id = resolveId(call.id, store)
    return fetchJson(`${base}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resolveBody(call.body ?? {}, store)),
    })
  }

  if (call.action === 'delete') {
    const id = resolveId(call.id, store)
    return fetchJson(`${base}/${id}`, { method: 'DELETE' })
  }

  throw new Error(`Unknown DataCall action: ${String(call.action)}`)
}

async function fetchJson(url: string, init?: RequestInit): Promise<unknown> {
  const res = await fetch(url, init)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HTTP ${res.status}: ${text}`)
  }
  if (res.status === 204) return null
  return res.json() as Promise<unknown>
}

function applyFilterSubstitution(filter: string, store: StateStore): string {
  return filter.replace(/\{(\/[^}]+)\}/g, (_match, path: string) => {
    const value = store.get(path)
    return value !== undefined && value !== null ? String(value) : ''
  })
}

function resolveId(id: DataCall['id'], store: StateStore): string {
  if (typeof id === 'string') return id
  if (id !== undefined && '$route' in id) {
    const value = store.get(`/route/params/${id.$route}`)
    return String(value ?? '')
  }
  if (id !== undefined && '$state' in id) {
    const value = store.get(id.$state)
    return String(value ?? '')
  }
  throw new Error('DataCall is missing an id field')
}

function resolveBody(body: Record<string, string>, store: StateStore): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(body)) {
    result[key] = value.startsWith('/') ? store.get(value) : value
  }
  return result
}
