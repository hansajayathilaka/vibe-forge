export function onDeleteClick({ model }) {
  model.set('/ui/confirmDeleteOpen', true)
}

export function onCancelDelete({ model }) {
  model.set('/ui/confirmDeleteOpen', false)
}

export function onConfirmDelete({ model }) {
  model.set('/ui/confirmDeleteOpen', false)
  // The actual delete callData action is chained in the spec after this
}
