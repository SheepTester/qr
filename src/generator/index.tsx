import {
  QRCodeErrorCorrectionLevel,
  QRCodeMaskPattern,
  QRCodeRenderersOptions,
  toCanvas,
  toString
} from 'qrcode'
import { useEffect, useMemo, useState } from 'react'
import common from '../common.module.css'
import { download } from '../lib/download'
import { GenerateButtons } from './GenerateButtons'
import styles from './index.module.css'
import { QrText } from './QrText'
import { useQr, UseQrOptions } from './useQr'

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
  const [mask, setMask] = useState<QRCodeMaskPattern | null>(null)
  const [pixelSize, setPixelSize] = useState('10')
  const [opaque, setOpaque] = useState(true)
  const [margin, setMargin] = useState(true)

  const qrOptions = useMemo<UseQrOptions>(
    () => ({
      errorCorrectionLevel: ecl,
      maskPattern: mask ?? undefined,
      className: styles.generatedQr
    }),
    [ecl, mask]
  )
  const { code, canvas } = useQr(text, qrOptions)

  function getQrOptions (): QRCodeRenderersOptions {
    return {
      errorCorrectionLevel: ecl,
      maskPattern: mask ?? undefined,
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
        code.error === 'too-big' ? (
          <div className={styles.error}>
            QR codes can't hold that much data!
          </div>
        ) : code.error === 'unknown' ? (
          <div className={styles.error}>An error occurred.</div>
        ) : (
          canvas
        )
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
          actualMask={'maskPattern' in code ? code.maskPattern : undefined}
          mask={mask}
          onMask={setMask}
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
