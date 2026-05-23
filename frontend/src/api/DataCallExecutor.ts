import type { DataCall } from '@shared/types/index.js'
import { pbClient } from './PocketBaseClient.js'

export interface StateStore {
  get: (path: string) => unknown
  set: (path: string, value: unknown) => void
}

export class DataCallExecutor {
  static async run(call: DataCall, store: StateStore): Promise<void> {
    store.set(`/data/${call.name}/_loading`, true)
    store.set(`/data/${call.name}/_error`, null)
    try {
      const result = await DataCallExecutor.execute(call, store)
      DataCallExecutor.writeResult(call, result, store)
    } catch (err) {
      store.set(`/data/${call.name}/_error`, err instanceof Error ? err.message : String(err))
    } finally {
      store.set(`/data/${call.name}/_loading`, false)
    }
  }

  private static async execute(call: DataCall, store: StateStore): Promise<unknown> {
    if (call.action === 'list') {
      return pbClient.list(call.collection, {
        filter: call.filter !== undefined ? applyFilterSubstitution(call.filter, store) : undefined,
        sort: call.sort,
        expand: call.expand,
      })
    }

    if (call.action === 'get') {
      const id = resolveId(call.id, store)
      return pbClient.get(call.collection, id, { expand: call.expand })
    }

    if (call.action === 'create') {
      return pbClient.create(call.collection, resolveBody(call.body ?? {}, store))
    }

    if (call.action === 'update') {
      const id = resolveId(call.id, store)
      return pbClient.update(call.collection, id, resolveBody(call.body ?? {}, store))
    }

    if (call.action === 'delete') {
      const id = resolveId(call.id, store)
      await pbClient.delete(call.collection, id)
      return null
    }

    throw new Error(`Unknown DataCall action: ${String(call.action)}`)
  }

  private static writeResult(call: DataCall, result: unknown, store: StateStore): void {
    if (call.action === 'list') {
      const list = result as { items: unknown[]; totalItems: number }
      store.set(`/data/${call.name}/items`, list.items)
      store.set(`/data/${call.name}/totalItems`, list.totalItems)
    } else if (call.action !== 'delete') {
      store.set(`/data/${call.name}`, result)
    }
  }
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
  throw new Error('DataCall is missing an id field')
}

function resolveBody(body: Record<string, string>, store: StateStore): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(body)) {
    result[key] = value.startsWith('/') ? store.get(value) : value
  }
  return result
}
