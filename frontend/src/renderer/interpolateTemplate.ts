/**
 * Resolves ${/path} expressions in a template string using the store.
 * Example: "/posts/${/data/post/id}" → "/posts/abc123"
 */
export function interpolateTemplate(
  template: string,
  get: (path: string) => unknown,
): string {
  return template.replace(/\$\{(\/[^}]+)\}/g, (_match, path: string) => {
    const value = get(path)
    return value !== undefined && value !== null ? String(value) : ''
  })
}
