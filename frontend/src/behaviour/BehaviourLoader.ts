import type { BehaviourContext } from './BehaviourContext.js'

type BehaviourModule = Record<string, (context: BehaviourContext) => unknown>

const cache = new Map<string, BehaviourModule>()

const PB_URL = (import.meta.env.VITE_PB_URL as string | undefined) ?? 'http://localhost:8090'

export async function loadBehaviour(name: string): Promise<BehaviourModule> {
  if (cache.has(name)) return cache.get(name)!
  const url = `${PB_URL}/behaviours/${name}.js`
  const mod = await import(/* @vite-ignore */ url) as BehaviourModule
  cache.set(name, mod)
  return mod
}
