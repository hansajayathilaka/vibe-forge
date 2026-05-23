import PocketBase from 'pocketbase'
import type { ApiClient, ListOptions, GetOptions, ListResult } from './ApiClient.js'

const PB_URL = (import.meta.env.VITE_PB_URL as string | undefined) ?? 'http://localhost:8090'

export class PocketBaseClient implements ApiClient {
  private pb = new PocketBase(PB_URL)

  async list(collection: string, options: ListOptions = {}): Promise<ListResult> {
    const result = await this.pb.collection(collection).getList(options.page ?? 1, options.perPage ?? 200, {
      filter: options.filter,
      sort: options.sort,
      expand: options.expand,
    })
    return { items: result.items, totalItems: result.totalItems }
  }

  get(collection: string, id: string, options: GetOptions = {}): Promise<Record<string, unknown>> {
    return this.pb.collection(collection).getOne(id, { expand: options.expand })
  }

  create(collection: string, body: object): Promise<Record<string, unknown>> {
    return this.pb.collection(collection).create(body as Record<string, unknown>)
  }

  update(collection: string, id: string, body: object): Promise<Record<string, unknown>> {
    return this.pb.collection(collection).update(id, body as Record<string, unknown>)
  }

  async delete(collection: string, id: string): Promise<void> {
    await this.pb.collection(collection).delete(id)
  }
}

export const pbClient = new PocketBaseClient()
