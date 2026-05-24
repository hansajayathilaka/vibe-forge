const GAP: Record<number, string> = {
  0: 'gap-0', 1: 'gap-1', 2: 'gap-2', 3: 'gap-3', 4: 'gap-4',
  5: 'gap-5', 6: 'gap-6', 8: 'gap-8', 10: 'gap-10', 12: 'gap-12', 16: 'gap-16',
}

const PAD: Record<number, string> = {
  0: 'p-0', 1: 'p-1', 2: 'p-2', 3: 'p-3', 4: 'p-4',
  5: 'p-5', 6: 'p-6', 8: 'p-8', 10: 'p-10', 12: 'p-12', 16: 'p-16',
}

const ALIGN: Record<string, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
}

export function gapClass(n?: number | null): string {
  return n != null ? (GAP[n] ?? '') : ''
}

export function padClass(n?: number | null): string {
  return n != null ? (PAD[n] ?? '') : ''
}

export function alignClass(a?: string | null): string {
  return a != null ? (ALIGN[a] ?? '') : ''
}

export function cx(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function elemCls(element: { props: Record<string, unknown> }): string | undefined {
  const cls = element.props.className
  return typeof cls === 'string' ? cls : undefined
}
