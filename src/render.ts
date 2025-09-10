import { ReactNode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'

// Avoid bundling `hydrateRoot` when built (though React doesn't seem to be tree
// shakeable so this currently doesn't do anything)
declare const DEV_MODE: boolean

export function render (app: ReactNode): void {
  const root = document.getElementById('root')
  if (!root) {
    throw new TypeError('#root not found')
  }
  if (DEV_MODE) {
    createRoot(root).render(app)
  } else {
    hydrateRoot(root, app)
  }
}
