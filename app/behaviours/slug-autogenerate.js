export function onTitleChange({ model }) {
  const title = model.get('/form/title') ?? ''
  const slug = title.toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
  model.set('/form/slug', slug)
}
