/**
 * Verifies the runBehaviour action pipeline:
 * screen JSON → Button click → loadBehaviour → fn called with context
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

const TEST_SCREEN: UiScreen = {
  id: 'test-behaviour',
  title: 'Test',
  route: '/test',
  data: [],
  spec: {
    root: 'page',
    state: { form: { slug: '' } },
    elements: {
      page: { type: 'Column', props: {}, children: ['run-btn', 'slug-display'] },
      'run-btn': {
        type: 'Button',
        props: { label: 'Run Behaviour' },
        children: [],
        actions: {
          click: [{ action: 'runBehaviour', params: { file: 'test-mod', fn: 'doAction' } }],
        },
      },
      'slug-display': {
        type: 'Text',
        props: { text: { '$state': '/form/slug' } },
        children: [],
      },
    },
  },
}

describe('runBehaviour integration', () => {
  beforeEach(async () => {
    const { configSource } = await import('../../config/index.js')
    vi.mocked(configSource.getScreen).mockResolvedValue(TEST_SCREEN)
  })

  it('calls loadBehaviour with the correct file name when the button is clicked', async () => {
    const { loadBehaviour } = await import('../../behaviour/BehaviourLoader.js')
    const mockFn = vi.fn()
    vi.mocked(loadBehaviour).mockResolvedValue({ doAction: mockFn })

    renderScreen(TEST_SCREEN)
    const btn = await screen.findByRole('button', { name: 'Run Behaviour' })
    await userEvent.click(btn)

    expect(loadBehaviour).toHaveBeenCalledWith('test-mod')
  })

  it('calls the named export from the behaviour module', async () => {
    const { loadBehaviour } = await import('../../behaviour/BehaviourLoader.js')
    const doAction = vi.fn()
    vi.mocked(loadBehaviour).mockResolvedValue({ doAction })

    renderScreen(TEST_SCREEN)
    const btn = await screen.findByRole('button', { name: 'Run Behaviour' })
    await userEvent.click(btn)

    expect(doAction).toHaveBeenCalledOnce()
  })

  it('passes a model with get and set to the behaviour function', async () => {
    const { loadBehaviour } = await import('../../behaviour/BehaviourLoader.js')
    let capturedContext: Record<string, unknown> | null = null
    vi.mocked(loadBehaviour).mockResolvedValue({
      doAction: (ctx: unknown) => { capturedContext = ctx as Record<string, unknown> },
    })

    renderScreen(TEST_SCREEN)
    const btn = await screen.findByRole('button', { name: 'Run Behaviour' })
    await userEvent.click(btn)

    await waitFor(() => expect(capturedContext).not.toBeNull())
    const model = capturedContext!['model'] as Record<string, unknown>
    expect(typeof model.get).toBe('function')
    expect(typeof model.set).toBe('function')
  })

  it('allows the behaviour to update state, which is reflected in bound elements', async () => {
    const { loadBehaviour } = await import('../../behaviour/BehaviourLoader.js')
    vi.mocked(loadBehaviour).mockResolvedValue({
      doAction: ({ model }: { model: { get: (p: string) => unknown; set: (p: string, v: unknown) => void } }) => {
        model.set('/form/slug', 'hello-world')
      },
    })

    renderScreen(TEST_SCREEN)
    const btn = await screen.findByRole('button', { name: 'Run Behaviour' })
    await userEvent.click(btn)

    await waitFor(() => {
      expect(screen.getByText('hello-world')).toBeInTheDocument()
    })
  })
})
