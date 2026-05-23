import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import type { ScreenMeta } from '../config/index.js'
import { configSource } from '../config/index.js'
import { ScreenRenderer } from '../renderer/ScreenRenderer.js'
import { FullPageSpinner } from './FullPageSpinner.js'
import { FullPageError } from './FullPageError.js'

export function AppRouter() {
  const [screens, setScreens] = useState<ScreenMeta[] | null>(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    configSource
      .listScreens()
      .then(setScreens)
      .catch((err: unknown) => setError(err instanceof Error ? err : new Error(String(err))))
  }, [])

  if (error) return <FullPageError error={error} />
  if (!screens) return <FullPageSpinner />

  return (
    <Routes>
      {screens.map(meta => (
        <Route
          key={meta.id}
          path={meta.route}
          element={<ScreenRenderer screenId={meta.id} />}
        />
      ))}
      <Route path="*" element={<ScreenRenderer screenId="_404" />} />
    </Routes>
  )
}
