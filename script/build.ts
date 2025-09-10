import esbuild from 'esbuild'
import { exec } from 'child_process'

const args = process.argv.slice(2)
const devMode = args.includes('dev')

const context = await esbuild.context({
  entryPoints: ['src/index.tsx'],
  bundle: true,
  loader: { '.svg': 'file' },
  outdir: devMode ? 'static/' : 'dist/',
  sourcemap: devMode,
  minify: !devMode,
  format: 'esm',
  supported: { nesting: !devMode },
  define: {
    DEV_MODE: String(devMode)
  }
})

if (devMode) {
  const { host, port } = await context.serve({ servedir: 'static/' })
  console.log(`http://${host}:${port}/`)
} else {
  await context.rebuild()
  await context.dispose()

  await esbuild.build({
    entryPoints: ['script/build-react.tsx'],
    bundle: true,
    outfile: 'script/build-react.js',
    platform: 'node',
    packages: 'external',
    format: 'esm',
    minify: true
  })
  // @ts-ignore Won't exist until built
  await import('./build-react.js')
  // CSS module class name mangling might not be guaranteed to be consistent
  exec('diff script/build-react.css dist/index.css', (err, stdout, stderr) => {
    if (err) {
      console.error(err)
    } else {
      console.log(stdout, stderr)
    }
  })
}
