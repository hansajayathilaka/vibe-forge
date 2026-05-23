import type { UiScreen } from '@shared/types/index.js'

export interface ScreenMeta {
  id: string
  route: string
  title: string
}

export interface ConfigSource {
  getScreen(screenId: string): Promise<UiScreen>
  getBehaviourModule(name: string): Promise<Record<string, Function>>
  listScreens(): Promise<ScreenMeta[]>
}
