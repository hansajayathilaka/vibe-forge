const PB_URL = (import.meta.env.VITE_PB_URL as string | undefined) ?? 'http://localhost:8090'

export async function loadTheme(): Promise<void> {
  try {
    const res = await fetch(`${PB_URL}/styles/theme.css`)
    if (!res.ok) return
    const css = await res.text()
    const style = document.createElement('style')
    style.id = 'vf-theme'
    style.textContent = css
    document.head.appendChild(style)
  } catch {
    // No theme file or server not running — platform defaults apply.
  }
}
