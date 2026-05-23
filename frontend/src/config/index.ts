export type { ConfigSource, ScreenMeta } from './ConfigSource.js'
export { FileConfigSource } from './FileConfigSource.js'

import type { ConfigSource } from './ConfigSource.js'
import { FileConfigSource } from './FileConfigSource.js'

export const configSource: ConfigSource = new FileConfigSource(
  import.meta.env.VITE_PB_URL as string ?? 'http://localhost:8090'
)
