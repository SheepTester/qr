import {
  create,
  QRCodeErrorCorrectionLevel,
  QRCodeRenderersOptions,
  toCanvas,
  toString
} from 'qrcode'
import { useEffect, useRef, useState } from 'react'
import common from '../common.module.css'
import { download } from '../lib/download'
import { GenerateButtons } from './GenerateButtons'
import styles from './index.module.css'
import { QrText } from './QrText'

/** Modules (pixels) of quiet zone (whitespace) around the QR code */
const QUIET_ZONE = 4

export type GeneratorProps = {
  welcome: boolean
  hidden: boolean
  onUse: () => void
  onKeyboard: (visible: boolean) => void
}
export function Generator ({
  welcome,
  hidden,
  onUse,
  onKeyboard
}: GeneratorProps) {
  const [text, setText] = useState('')
  const [ecl, setEcl] = useState<QRCodeErrorCorrectionLevel>('M')
  const [pixelSize, setPixelSize] = useState('10')
  const [opaque, setOpaque] = useState(true)
  const [margin, setMargin] = useState(true)
  const context = useRef<CanvasRenderingContext2D | null>(null)

  useEffect(() => {
    if (!context.current) {
      return
    }
    try {
      const code = create(text, { errorCorrectionLevel: ecl })
      const image = new ImageData(
        new Uint8ClampedArray(
          Array.from(code.modules.data, bit =>
            bit ? [0, 0, 0, 255] : [255, 255, 255, 0]
          ).flat()
        ),
        code.modules.size
      )
      context.current.canvas.width = code.modules.size + QUIET_ZONE * 2
      context.current.canvas.height = code.modules.size + QUIET_ZONE * 2
      context.current.canvas.style.setProperty(
        '--module-size',
        `${code.modules.size}`
      )
      context.current.putImageData(image, QUIET_ZONE, QUIET_ZONE)
    } catch {
      context.current.canvas.width = 0
      context.current.canvas.height = 0
    }
  }, [text, ecl])

  function getQrOptions (): QRCodeRenderersOptions {
    return {
      errorCorrectionLevel: ecl,
      scale: +pixelSize,
      color: {
        dark: '#000',
        // #0000 is transparent
        light: opaque ? '#fff' : '#0000'
      },
      margin: margin ? undefined : 0
    }
  }

  async function getPng (): Promise<Blob> {
    const canvas = await toCanvas(text, getQrOptions())
    return new Promise((resolve, reject) =>
      canvas.toBlob(
        blob =>
          blob
            ? resolve(blob)
            : reject(new Error('Failed to generate blob from canvas')),
        'image/png'
      )
    )
  }

  async function getSvg (): Promise<Blob> {
    const svg = await toString(text, { type: 'svg', ...getQrOptions() })
    return new Blob([svg], { type: 'image/svg+xml' })
  }

  useEffect(() => {
    if (navigator.virtualKeyboard) {
      navigator.virtualKeyboard.overlaysContent = true

      const handleGeometryChange = () => {
        onKeyboard(!!navigator.virtualKeyboard?.boundingRect.height)
      }
      navigator.virtualKeyboard.addEventListener(
        'geometrychange',
        handleGeometryChange
      )
      return () => {
        navigator.virtualKeyboard?.removeEventListener(
          'geometrychange',
          handleGeometryChange
        )
      }
    }
  }, [])

  return (
    <div
      className={`${common.section} ${styles.generateWrapper}`}
      style={{ display: hidden ? 'none' : '' }}
    >
      {welcome ? <h2 className={common.heading}>Generate a QR code</h2> : null}
      {!welcome ? (
        <canvas
          className={styles.generatedQr}
          ref={canvas => (context.current = canvas?.getContext('2d') ?? null)}
        />
      ) : null}
      {!welcome ? (
        <GenerateButtons
          onCopyPng={async () => {
            const png = await getPng()
            navigator.clipboard.write([new ClipboardItem({ [png.type]: png })])
          }}
          onDownloadPng={async () => download(await getPng(), 'qr-code.png')}
          onDownloadSvg={async () => download(await getSvg(), 'qr-code.svg')}
          hidden={text === ''}
          ecl={ecl}
          onEcl={setEcl}
          pixelSize={pixelSize}
          onPixelSize={setPixelSize}
          opaque={opaque}
          onOpaque={setOpaque}
          margin={margin}
          onMargin={setMargin}
        />
      ) : null}
      <QrText text={text} onText={setText} onFocus={onUse} />
    </div>
  )
}
