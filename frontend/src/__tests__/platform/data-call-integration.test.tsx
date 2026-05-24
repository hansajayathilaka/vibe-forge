/**
 * Verifies the DataCall pipeline:
 * load trigger fires on mount, manual trigger fires only on action, fetch URL is correct
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
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

const LOAD_SCREEN: UiScreen = {
  id: 'test-load',
  title: 'Test',
  route: '/test',
  data: [{ name: 'posts', action: 'list', collection: 'posts', trigger: 'load' }],
  spec: {
    root: 'page',
    state: {},
    elements: {
      page: { type: 'Column', props: {}, children: ['loading-text'] },
      'loading-text': {
        type: 'Text',
        props: { text: { '$state': '/data/posts/_loading' } },
        children: [],
      },
    },
  },
}

const MANUAL_SCREEN: UiScreen = {
  id: 'test-manual',
  title: 'Test',
  route: '/test',
  data: [{ name: 'submit', action: 'create', collection: 'posts', trigger: 'manual' }],
  spec: {
    root: 'page',
    state: {},
    elements: {
      page: { type: 'Column', props: {}, children: ['submit-btn'] },
      'submit-btn': {
        type: 'Button',
        props: { label: 'Submit' },
        children: [],
        actions: {
          click: [{ action: 'callData', params: { name: 'submit' } }],
        },
      },
    },
  },
}

const mockListResponse = { items: [{ id: '1', title: 'Test Post' }], totalItems: 1 }
const mockCreateResponse = { id: '2', title: 'New Post' }

describe('DataCall — load trigger', () => {
  let mockFetch: ReturnType<typeof vi.fn>

  beforeEach(async () => {
    const { configSource } = await import('../../config/index.js')
    vi.mocked(configSource.getScreen).mockResolvedValue(LOAD_SCREEN)

    mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockListResponse,
    })
    vi.stubGlobal('fetch', mockFetch)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('calls fetch on mount for a trigger:load DataCall', async () => {
    renderScreen(LOAD_SCREEN)
    await waitFor(() => expect(mockFetch).toHaveBeenCalled())
  })

  it('fetches from the correct PocketBase collection URL', async () => {
    renderScreen(LOAD_SCREEN)
    await waitFor(() => expect(mockFetch).toHaveBeenCalled())

    const url: string = mockFetch.mock.calls[0][0] as string
    expect(url).toContain('/api/collections/posts/records')
  })
})

describe('DataCall — manual trigger', () => {
  let mockFetch: ReturnType<typeof vi.fn>

  beforeEach(async () => {
    const { configSource } = await import('../../config/index.js')
    vi.mocked(configSource.getScreen).mockResolvedValue(MANUAL_SCREEN)

    mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockCreateResponse,
    })
    vi.stubGlobal('fetch', mockFetch)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('does NOT call fetch on mount for a trigger:manual DataCall', async () => {
    renderScreen(MANUAL_SCREEN)
    // wait for screen to finish rendering
    await screen.findByRole('button', { name: 'Submit' })
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('calls fetch when a callData action fires the manual DataCall', async () => {
    renderScreen(MANUAL_SCREEN)
    const btn = await screen.findByRole('button', { name: 'Submit' })
    await userEvent.click(btn)

    await waitFor(() => expect(mockFetch).toHaveBeenCalled())
    const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('/api/collections/posts/records')
    expect(options.method).toBe('POST')
  })
})

describe('DataCall — error handling', () => {
  beforeEach(async () => {
    const { configSource } = await import('../../config/index.js')
    vi.mocked(configSource.getScreen).mockResolvedValue(LOAD_SCREEN)

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => 'Internal Server Error',
    }))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('sets the _loading flag back to false after a fetch error', async () => {
    renderScreen(LOAD_SCREEN)
    // loading indicator eventually disappears (false renders as "false" or "" — either way, loading ends)
    await waitFor(() => {
      const text = screen.queryByText('true')
      expect(text).not.toBeInTheDocument()
    })
  })
})
