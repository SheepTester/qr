import fs from 'fs/promises'
import { renderToString } from 'react-dom/server'
import { PeerApp } from '../src/PeerApp'

await fs.writeFile(
  'dist/peer/index.html',
  (
    await fs.readFile('static/peer/index.html', 'utf-8')
  ).replace(
    '<div id="root"></div>',
    () => `<div id="root">${renderToString(<PeerApp />)}</div>`
  )
)
