import { createRoot, hydrateRoot } from 'react-dom/client'
import { App } from './App'
import { PeerApp } from './PeerApp'

// Avoid bundling `hydrateRoot` when built (though React doesn't seem to be tree
// shakeable so this currently doesn't do anything)
declare const DEV_MODE: boolean

const root = document.getElementById('root')
if (!root) {
  throw new TypeError('#root not found')
}
const app = /\/peer\/?$/.test(window.location.pathname) ? <PeerApp /> : <App />
if (DEV_MODE) {
  createRoot(root).render(app)
} else {
  hydrateRoot(root, app)
}
