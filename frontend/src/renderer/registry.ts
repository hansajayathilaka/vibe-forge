import type { ComponentRegistry } from '@json-render/react'
import type { DataCall } from '@shared/types/index.js'
import {
  Column, Row, Grid, Card, Text, Button, Link, Image,
  Divider, Badge, Spacer, DataTable, Form, TextField,
  TextArea, Select, Checkbox, Modal, Tabs,
} from '../components/index.js'
import { triggerDataCall, type StateStore } from './triggerDataCall.js'
import { loadBehaviour } from '../behaviour/BehaviourLoader.js'
import { interpolateTemplate } from './interpolateTemplate.js'

export const componentRegistry: ComponentRegistry = {
  Column, Row, Grid, Card, Text, Button, Link, Image,
  Divider, Badge, Spacer, DataTable, Form, TextField,
  TextArea, Select, Checkbox, Modal, Tabs,
}

export function createActionHandlers(
  store: StateStore,
  dataCalls: DataCall[],
  navigate: (to: string) => void,
): Record<string, (params: Record<string, unknown>) => Promise<unknown> | unknown> {
  return {
    callData: async (params) => {
      await triggerDataCall(String(params['name']), store, dataCalls)
    },
    navigate: (params) => {
      navigate(interpolateTemplate(String(params['to']), store.get))
    },
    runBehaviour: async (params) => {
      const mod = await loadBehaviour(String(params['file']))
      const fn = mod[String(params['fn'])]
      await fn({ model: store, navigate })
    },
  }
}
