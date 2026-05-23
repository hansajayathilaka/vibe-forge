import PocketBase, { type RecordModel, type ListResult } from 'pocketbase'

const PB_URL = (import.meta.env.VITE_PB_URL as string | undefined) ?? 'http://localhost:8090'

export interface ListOptions {
  filter?: string
  sort?: string
  expand?: string
  page?: number
  perPage?: number
}

export interface GetOptions {
  expand?: string
}

export class PocketBaseClient {
  private pb = new PocketBase(PB_URL)

  list(collection: string, options: ListOptions = {}): Promise<ListResult<RecordModel>> {
    return this.pb.collection(collection).getList(options.page ?? 1, options.perPage ?? 200, {
      filter: options.filter,
      sort: options.sort,
      expand: options.expand,
    })
  }

  get(collection: string, id: string, options: GetOptions = {}): Promise<RecordModel> {
    return this.pb.collection(collection).getOne(id, { expand: options.expand })
  }

  create(collection: string, body: object): Promise<RecordModel> {
    return this.pb.collection(collection).create(body as Record<string, unknown>)
  }

  update(collection: string, id: string, body: object): Promise<RecordModel> {
    return this.pb.collection(collection).update(id, body as Record<string, unknown>)
  }

  async delete(collection: string, id: string): Promise<void> {
    await this.pb.collection(collection).delete(id)
  }
}

export const pbClient = new PocketBaseClient()
