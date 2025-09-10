import { exec } from 'child_process'
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
  supported: { nesting: !devMode },
  define: {
    DEV_MODE: String(devMode)
  }
})

if (devMode) {
  const { host, port } = await context.serve({ servedir: 'static/' })
  console.log(`http://${host}:${port}/`)
  console.log(`http://${host}:${port}/peer/`)
} else {
  await context.rebuild()
  await context.dispose()

  await fs.mkdir('dist/peer/', { recursive: true })

  for (const [entry, cssPath] of Object.entries({
    'script/build-qr.tsx': 'dist/index.css',
    'script/build-peer.tsx': 'dist/index-peer.css'
  })) {
    await esbuild.build({
      entryPoints: [entry],
      bundle: true,
      outfile: 'script/build.js',
      platform: 'node',
      packages: 'external',
      format: 'esm',
      minify: true
    })
    // @ts-ignore Won't exist until built
    await import(`./build-react.js?_=${entry}`)
    // CSS module class name mangling might not be guaranteed to be consistent
    const { stdout, stderr } = await new Promise<{
      stdout: string
      stderr: string
    }>((resolve, reject) => {
      exec(`diff script/build.css ${cssPath}`, (err, stdout, stderr) => {
        if (err) {
          reject(err)
        } else {
          resolve({ stdout, stderr })
        }
      })
    })
    if (stdout || stderr) {
      console.log({ stdout, stderr })
    }
  }
}
