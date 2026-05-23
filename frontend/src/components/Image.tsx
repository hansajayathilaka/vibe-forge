import type { ComponentRenderProps } from '@json-render/react'
import { useState } from 'react'

interface ImageProps {
  src?: unknown
  alt: string
  width?: number
  height?: number
}

export function Image(rawProps: ComponentRenderProps) {
  const { src, alt, width, height } = rawProps as unknown as ImageProps
  const [errored, setErrored] = useState(false)

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
      width={width}
      height={height}
      className="max-w-full rounded"
      onError={() => setErrored(true)}
    />
  )
}
