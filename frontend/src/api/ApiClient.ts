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

export interface ListResult {
  items: Record<string, unknown>[]
  totalItems: number
}

export interface ApiClient {
  list(collection: string, options?: ListOptions): Promise<ListResult>
  get(collection: string, id: string, options?: GetOptions): Promise<Record<string, unknown>>
  create(collection: string, body: object): Promise<Record<string, unknown>>
  update(collection: string, id: string, body: object): Promise<Record<string, unknown>>
  delete(collection: string, id: string): Promise<void>
}
