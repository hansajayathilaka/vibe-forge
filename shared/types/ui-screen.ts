// Screen element as stored in JSON files.
// The element's ID is its key in the elements map — not a field in the object.
export interface UiElementSpec {
  type: string
  props: Record<string, unknown>
  children?: string[]
  actions?: Record<string, UiActionDef | UiActionDef[]>
  repeat?: { statePath: string; key: string }
  showIf?: unknown
}

export interface UiActionDef {
  action: string
  params: Record<string, unknown>
}

// The json-render spec section of a screen file.
// Extends UITree with a state field for initial store values.
export interface ScreenSpec {
  root: string
  elements: Record<string, UiElementSpec>
  state?: Record<string, unknown>
}

export type DataCallAction = 'list' | 'get' | 'create' | 'update' | 'delete'
export type DataCallTrigger = 'load' | 'manual'

export interface DataCall {
  name: string
  action: DataCallAction
  collection: string
  filter?: string
  sort?: string
  expand?: string
  id?: string | { $route: string } | { $state: string }
  body?: Record<string, string>
  trigger: DataCallTrigger
}

export interface UiScreen {
  $schema?: string
  id: string
  title: string
  route: string
  data?: DataCall[]
  spec: ScreenSpec
}
