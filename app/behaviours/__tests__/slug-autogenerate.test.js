import { describe, it, expect, vi } from 'vitest'
import { onTitleChange } from '../slug-autogenerate.js'

function makeModel(data = {}) {
  const store = new Map(Object.entries(data))
  return {
    get: (path) => store.get(path),
    set: vi.fn((path, value) => store.set(path, value)),
  }
}

describe('slug-autogenerate — onTitleChange', () => {
  it('converts a plain title to a hyphenated slug', () => {
    const model = makeModel({ '/form/title': 'Hello World' })
    onTitleChange({ model })
    expect(model.set).toHaveBeenCalledWith('/form/slug', 'hello-world')
  })

  it('strips punctuation and special characters', () => {
    const model = makeModel({ '/form/title': 'Hello, World!' })
    onTitleChange({ model })
    expect(model.set).toHaveBeenCalledWith('/form/slug', 'hello-world')
  })

  it('collapses multiple spaces into a single hyphen', () => {
    const model = makeModel({ '/form/title': 'Hello  World' })
    onTitleChange({ model })
    expect(model.set).toHaveBeenCalledWith('/form/slug', 'hello-world')
  })

  it('trims leading and trailing whitespace', () => {
    const model = makeModel({ '/form/title': '  trim me  ' })
    onTitleChange({ model })
    expect(model.set).toHaveBeenCalledWith('/form/slug', 'trim-me')
  })

  it('produces an empty slug for an empty title', () => {
    const model = makeModel({ '/form/title': '' })
    onTitleChange({ model })
    expect(model.set).toHaveBeenCalledWith('/form/slug', '')
  })

  it('handles a title that is already lowercase with hyphens', () => {
    const model = makeModel({ '/form/title': 'already-fine' })
    onTitleChange({ model })
    expect(model.set).toHaveBeenCalledWith('/form/slug', 'already-fine')
  })

  it('defaults to empty string when title is undefined', () => {
    const model = makeModel({})
    onTitleChange({ model })
    expect(model.set).toHaveBeenCalledWith('/form/slug', '')
  })
})
