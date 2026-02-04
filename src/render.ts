import { ReactNode } from 'react'
import { createRoot } from 'react-dom/client'

export function render (app: ReactNode): void {
  const root = document.getElementById('root')
  if (!root) {
    throw new TypeError('#root not found')
  }
  createRoot(root).render(app)
}
