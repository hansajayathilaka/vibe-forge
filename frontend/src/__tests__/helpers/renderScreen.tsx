import { render } from '@testing-library/react'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'
import type { MutableRefObject } from 'react'
import { ScreenRenderer } from '../../renderer/ScreenRenderer.js'
import type { UiScreen } from '@shared/types/index.js'

function PathTracker({ pathRef }: { pathRef: MutableRefObject<string> }) {
  pathRef.current = useLocation().pathname
  return null
}

export interface RenderScreenResult extends ReturnType<typeof render> {
  getPath: () => string
}

export function renderScreen(screenObj: UiScreen, initialPath = '/'): RenderScreenResult {
  const pathRef: MutableRefObject<string> = { current: initialPath }

  const result = render(
    <MemoryRouter initialEntries={[initialPath]}>
      <PathTracker pathRef={pathRef} />
      <Routes>
        <Route path="*" element={<ScreenRenderer screenId={screenObj.id} />} />
      </Routes>
    </MemoryRouter>,
  )

  return { ...result, getPath: () => pathRef.current }
}
