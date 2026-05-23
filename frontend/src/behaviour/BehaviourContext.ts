export interface BehaviourContext {
  model: {
    get(path: string): unknown
    set(path: string, value: unknown): void
  }
  navigate(to: string): void
}
