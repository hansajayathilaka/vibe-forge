import type { ComponentRenderProps } from '@json-render/react'
import { useData } from '@json-render/react'
import { useState } from 'react'

interface ImageProps {
  src?: unknown
  alt: string
  width?: number | null
  height?: number | null
}

export function Image({ element }: ComponentRenderProps) {
  const { get } = useData()
  const { src: srcRaw, alt, width, height } = element.props as unknown as ImageProps
  const [errored, setErrored] = useState(false)

  let src: unknown = srcRaw
  if (srcRaw !== null && typeof srcRaw === 'object' && '$state' in srcRaw) {
    src = get((srcRaw as { '$state': string })['$state'])
  }

  if (errored || !src) {
    return (
      <div
        className="bg-gray-100 border border-gray-200 rounded flex items-center justify-center text-gray-400 text-sm"
        style={{ width: width ? `${width}px` : '100%', height: height ? `${height}px` : '200px' }}
      >
        {alt || 'Image'}
      </div>
    )
  }

  return (
    <img
      src={String(src)}
      alt={alt}
      width={width ?? undefined}
      height={height ?? undefined}
      className="max-w-full rounded"
      onError={() => setErrored(true)}
    />
  )
}
