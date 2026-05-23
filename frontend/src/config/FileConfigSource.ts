import type { UiScreen } from '@shared/types/index.js'
import type { ConfigSource, ScreenMeta } from './ConfigSource.js'

export class FileConfigSource implements ConfigSource {
  private readonly baseUrl: string
  private readonly behaviourCache = new Map<string, Record<string, Function>>()

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '')
  }

  async getScreen(screenId: string): Promise<UiScreen> {
    const res = await fetch(`${this.baseUrl}/screens/${screenId}.json`)
    if (!res.ok) {
      throw new Error(`Failed to load screen "${screenId}": ${res.status} ${res.statusText}`)
    }
    return res.json() as Promise<UiScreen>
  }

  async getBehaviourModule(name: string): Promise<Record<string, Function>> {
    const cached = this.behaviourCache.get(name)
    if (cached !== undefined) return cached

    const mod = await import(/* @vite-ignore */ `${this.baseUrl}/behaviours/${name}.js`) as Record<string, Function>
    this.behaviourCache.set(name, mod)
    return mod
  }

  async listScreens(): Promise<ScreenMeta[]> {
    const res = await fetch(`${this.baseUrl}/screens/_index.json`)
    if (!res.ok) {
      throw new Error(`Failed to load screen index: ${res.status} ${res.statusText}`)
    }
    return res.json() as Promise<ScreenMeta[]>
  }
}
