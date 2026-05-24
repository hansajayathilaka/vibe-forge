/**
 * Verifies $bindState two-way binding:
 * typing into a TextField updates state, reflected in a bound Text element
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

const BIND_SCREEN: UiScreen = {
  id: 'test-binding',
  title: 'Test',
  route: '/test',
  data: [],
  spec: {
    root: 'page',
    state: { form: { title: '' } },
    elements: {
      page: { type: 'Column', props: {}, children: ['title-field', 'title-preview'] },
      'title-field': {
        type: 'TextField',
        props: { label: 'Title', value: { '$bindState': '/form/title' } },
        children: [],
      },
      'title-preview': {
        type: 'Text',
        props: { text: { '$state': '/form/title' } },
        children: [],
      },
    },
  },
}

describe('$bindState two-way binding', () => {
  beforeEach(async () => {
    const { configSource } = await import('../../config/index.js')
    vi.mocked(configSource.getScreen).mockResolvedValue(BIND_SCREEN)
  })

  it('renders the TextField with the initial state value', async () => {
    renderScreen(BIND_SCREEN)
    const input = await screen.findByLabelText('Title')
    expect((input as HTMLInputElement).value).toBe('')
  })

  it('updates the bound Text element when the user types into the TextField', async () => {
    renderScreen(BIND_SCREEN)
    const input = await screen.findByLabelText('Title')
    await userEvent.type(input, 'Hello World')

    await waitFor(() => {
      expect(screen.getByText('Hello World')).toBeInTheDocument()
    })
  })

  it('keeps the TextField value in sync with the state', async () => {
    renderScreen(BIND_SCREEN)
    const input = await screen.findByLabelText('Title')
    await userEvent.clear(input)
    await userEvent.type(input, 'Sync test')

    await waitFor(() => {
      expect((input as HTMLInputElement).value).toBe('Sync test')
    })
  })
})

describe('slug autogenerate behaviour via $bindState', () => {
  const SLUG_SCREEN: UiScreen = {
    id: 'test-slug',
    title: 'Test',
    route: '/test',
    data: [],
    spec: {
      root: 'page',
      state: { form: { title: '', slug: '' } },
      elements: {
        page: { type: 'Column', props: {}, children: ['title-field', 'slug-display'] },
        'title-field': {
          type: 'TextField',
          props: { label: 'Title', value: { '$bindState': '/form/title' } },
          children: [],
          actions: {
            change: [{ action: 'runBehaviour', params: { file: 'slug-autogenerate', fn: 'onTitleChange' } }],
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

  beforeEach(async () => {
    const { configSource } = await import('../../config/index.js')
    vi.mocked(configSource.getScreen).mockResolvedValue(SLUG_SCREEN)

    const { loadBehaviour } = await import('../../behaviour/BehaviourLoader.js')
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore – plain JS behaviour file without type declarations
    const { onTitleChange } = await import('../../../../app/behaviours/slug-autogenerate.js')
    vi.mocked(loadBehaviour).mockResolvedValue({ onTitleChange })
  })

  it('auto-generates a slug when typing a title', async () => {
    renderScreen(SLUG_SCREEN)
    const input = await screen.findByLabelText('Title')
    await userEvent.type(input, 'Hello World')

    await waitFor(() => {
      expect(screen.getByText('hello-world')).toBeInTheDocument()
    })
  })
})
