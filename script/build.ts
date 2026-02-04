import esbuild from 'esbuild'
import fs from 'fs/promises'

const args = process.argv.slice(2)
const devMode = args.includes('dev')

const context = await esbuild.context({
  entryPoints: ['src/index.tsx', 'src/index-peer.tsx'],
  bundle: true,
  loader: { '.svg': 'file' },
  outdir: devMode ? 'static/' : 'dist/',
  sourcemap: devMode,
  minify: !devMode,
  supported: { nesting: !devMode }
})

if (devMode) {
  const { host, port } = await context.serve({ servedir: 'static/' })
  console.log(`http://${host}:${port}/`)
  console.log(`http://${host}:${port}/peer/`)
} else {
  await context.rebuild()
  await context.dispose()
  await fs.mkdir('dist/peer/', { recursive: true })
  await fs.copyFile('static/index.html', 'dist/index.html')
  await fs.copyFile('static/peer/index.html', 'dist/peer/index.html')
}
