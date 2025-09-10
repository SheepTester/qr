import fs from 'fs/promises'
import { renderToString } from 'react-dom/server'
import { App } from '../src/App'
import { PeerApp } from '../src/PeerApp'

await fs.mkdir('dist/peer/', { recursive: true })

await fs.writeFile(
  'dist/index.html',
  (
    await fs.readFile('static/index.html', 'utf-8')
  ).replace(
    '<div id="root"></div>',
    () => `<div id="root">${renderToString(<App />)}</div>`
  )
)

await fs.writeFile(
  'dist/peer/index.html',
  (
    await fs.readFile('static/peer/index.html', 'utf-8')
  ).replace(
    '<div id="root"></div>',
    () => `<div id="root">${renderToString(<PeerApp />)}</div>`
  )
)
