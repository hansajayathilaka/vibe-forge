/**
 * Verifies the navigate action: button click → React Router location changes
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

const NAV_SCREEN: UiScreen = {
  id: 'test-nav',
  title: 'Test',
  route: '/test',
  data: [],
  spec: {
    root: 'page',
    state: {},
    elements: {
      page: { type: 'Column', props: {}, children: ['go-btn'] },
      'go-btn': {
        type: 'Button',
        props: { label: 'Go to Posts' },
        children: [],
        actions: {
          click: [{ action: 'navigate', params: { to: '/posts' } }],
        },
      },
    },
  },
}

const TEMPLATE_NAV_SCREEN: UiScreen = {
  id: 'test-template-nav',
  title: 'Test',
  route: '/test',
  data: [],
  spec: {
    root: 'page',
    state: { data: { post: { id: 'abc123' } } },
    elements: {
      page: { type: 'Column', props: {}, children: ['go-btn'] },
      'go-btn': {
        type: 'Button',
        props: { label: 'Go to Post' },
        children: [],
        actions: {
          click: [{ action: 'navigate', params: { to: '/posts/${/data/post/id}' } }],
        },
      },
    },
  },
}

describe('navigate action', () => {
  beforeEach(async () => {
    const { configSource } = await import('../../config/index.js')
    vi.mocked(configSource.getScreen).mockResolvedValue(NAV_SCREEN)
  })

  it('changes the route after a navigate action fires', async () => {
    const { getPath } = renderScreen(NAV_SCREEN)
    const btn = await screen.findByRole('button', { name: 'Go to Posts' })
    await userEvent.click(btn)

    await waitFor(() => expect(getPath()).toBe('/posts'))
  })
})

describe('navigate action with $template', () => {
  beforeEach(async () => {
    const { configSource } = await import('../../config/index.js')
    vi.mocked(configSource.getScreen).mockResolvedValue(TEMPLATE_NAV_SCREEN)
  })

  it('interpolates state values into the target path', async () => {
    const { getPath } = renderScreen(TEMPLATE_NAV_SCREEN)
    const btn = await screen.findByRole('button', { name: 'Go to Post' })
    await userEvent.click(btn)

    await waitFor(() => expect(getPath()).toBe('/posts/abc123'))
  })
})
