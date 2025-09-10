import fs from 'fs/promises'
import { renderToString } from 'react-dom/server'
import { App } from '../src/App'

await fs.writeFile(
  'dist/index.html',
  (
    await fs.readFile('static/index.html', 'utf-8')
  ).replace(
    '<div id="root"></div>',
    () => `<div id="root">${renderToString(<App />)}</div>`
  )
)
