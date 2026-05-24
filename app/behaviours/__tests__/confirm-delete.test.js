import { describe, it, expect, vi } from 'vitest'
import { onDeleteClick, onCancelDelete, onConfirmDelete } from '../confirm-delete.js'

function makeModel() {
  return { get: vi.fn(), set: vi.fn() }
}

describe('confirm-delete behaviours', () => {
  describe('onDeleteClick', () => {
    it('opens the confirmation modal', () => {
      const model = makeModel()
      onDeleteClick({ model })
      expect(model.set).toHaveBeenCalledWith('/ui/confirmDeleteOpen', true)
    })

    it('calls set exactly once', () => {
      const model = makeModel()
      onDeleteClick({ model })
      expect(model.set).toHaveBeenCalledOnce()
    })
  })

  describe('onCancelDelete', () => {
    it('closes the confirmation modal', () => {
      const model = makeModel()
      onCancelDelete({ model })
      expect(model.set).toHaveBeenCalledWith('/ui/confirmDeleteOpen', false)
    })
  })

  describe('onConfirmDelete', () => {
    it('closes the confirmation modal', () => {
      const model = makeModel()
      onConfirmDelete({ model })
      expect(model.set).toHaveBeenCalledWith('/ui/confirmDeleteOpen', false)
    })

    it('does not call get — the actual delete is handled by the chained callData', () => {
      const model = makeModel()
      onConfirmDelete({ model })
      expect(model.get).not.toHaveBeenCalled()
    })
  })
})
