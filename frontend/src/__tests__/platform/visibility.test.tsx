/**
 * Verifies showIf visibility: elements hide/show based on state flags
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderScreen } from '../helpers/renderScreen.js'
import type { UiScreen } from '@shared/types/index.js'

vi.mock('../../config/index.js', () => ({
  configSource: {
    getScreen: vi.fn(),
    listScreens: vi.fn().mockResolvedValue([]),
    getBehaviourModule: vi.fn(),
  },
}))

vi.mock('../../behaviour/BehaviourLoader.js', () => ({
  loadBehaviour: vi.fn(),
}))

const VISIBILITY_SCREEN: UiScreen = {
  id: 'test-visibility',
  title: 'Test',
  route: '/test',
  data: [],
  spec: {
    root: 'page',
    state: { ui: { open: false } },
    elements: {
      page: { type: 'Column', props: {}, children: ['toggle-btn', 'secret-text'] },
      'toggle-btn': {
        type: 'Button',
        props: { label: 'Show' },
        children: [],
        actions: {
          click: [{ action: 'runBehaviour', params: { file: 'toggle', fn: 'open' } }],
        },
      },
      'secret-text': {
        type: 'Text',
        props: { text: 'Secret content' },
        children: [],
        showIf: { '$state': '/ui/open' },
      },
    },
  },
}

describe('showIf visibility', () => {
  beforeEach(async () => {
    const { configSource } = await import('../../config/index.js')
    vi.mocked(configSource.getScreen).mockResolvedValue(VISIBILITY_SCREEN)
  })

  it('hides an element when its showIf state is false', async () => {
    renderScreen(VISIBILITY_SCREEN)
    // wait for screen to load
    await screen.findByRole('button', { name: 'Show' })
    expect(screen.queryByText('Secret content')).not.toBeInTheDocument()
  })

  it('reveals an element when the state flag is set to true', async () => {
    const { loadBehaviour } = await import('../../behaviour/BehaviourLoader.js')
    vi.mocked(loadBehaviour).mockResolvedValue({
      open: ({ model }: { model: { set: (p: string, v: unknown) => void } }) => {
        model.set('/ui/open', true)
      },
    })

    renderScreen(VISIBILITY_SCREEN)
    const btn = await screen.findByRole('button', { name: 'Show' })
    await userEvent.click(btn)

    await waitFor(() => {
      expect(screen.getByText('Secret content')).toBeInTheDocument()
    })
  })
})
