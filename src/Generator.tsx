import { create, QRCodeErrorCorrectionLevel, toCanvas, toString } from 'qrcode'
import { useEffect, useId, useRef, useState } from 'react'
import * as Icon from 'react-feather'
import styles from './Generator.module.css'
import { download } from './lib/download'

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
  const id = useId()
  const [text, setText] = useState('')
  const [ecl, setEcl] = useState<QRCodeErrorCorrectionLevel>('M')
  const [pixelSize, setPixelSize] = useState('10')
  const [copied, setCopied] = useState(false)
  const copyTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
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

  async function getPng (): Promise<Blob> {
    const canvas = await toCanvas(text, {
      errorCorrectionLevel: ecl,
      scale: +pixelSize,
      color: {
        dark: '#000',
        // Transparent
        light: '#0000'
      }
    })
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
    const svg = await toString(text, {
      type: 'svg',
      errorCorrectionLevel: ecl,
      scale: +pixelSize,
      color: {
        dark: '#000',
        // Transparent
        light: '#0000'
      }
    })
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

  const CopyIcon = copied ? Icon.Check : Icon.Copy

  return (
    <div
      className={`section ${styles.generateWrapper}`}
      style={{ display: hidden ? 'none' : '' }}
    >
      {welcome ? <h2 className={`heading`}>Generate a QR code</h2> : null}
      {!welcome ? (
        <canvas
          className={styles.generatedQr}
          ref={canvas => (context.current = canvas?.getContext('2d') ?? null)}
        />
      ) : null}
      {!welcome ? (
        <div
          className={`${styles.generateBtnsWrapper} ${
            text === '' ? styles.generateBtnsEmpty : ''
          }`}
        >
          <div className={styles.generateBtns}>
            <button
              className={styles.generateBtn}
              onClick={async () => {
                setCopied(false)
                if (copyTimeout.current !== null) {
                  clearTimeout(copyTimeout.current)
                }
                const png = await getPng()
                navigator.clipboard.write([
                  new ClipboardItem({ [png.type]: png })
                ])
                setCopied(true)
                copyTimeout.current = setTimeout(() => {
                  setCopied(false)
                  copyTimeout.current = null
                }, 1000)
              }}
              title='Copy QR code as PNG'
            >
              <CopyIcon aria-label='Copy QR code as PNG' />
            </button>
            <div className={styles.genPanelWrapper}>
              <button className={styles.generateBtn}>
                <Icon.Download aria-label='Download as...' />
              </button>
              <div className={`${styles.genPanel} ${styles.downloads}`}>
                <button
                  className={styles.downloadBtn}
                  onClick={async () => download(await getPng(), 'qr-code.png')}
                >
                  <Icon.Download aria-hidden /> PNG
                </button>
                <button
                  className={styles.downloadBtn}
                  onClick={async () => download(await getSvg(), 'qr-code.svg')}
                >
                  <Icon.Download aria-hidden /> SVG
                </button>
              </div>
            </div>
            <div className={styles.genPanelWrapper}>
              <button className={styles.generateBtn}>
                <Icon.Settings aria-label='Settings' />
              </button>
              <div className={`${styles.genPanel} ${styles.settings}`}>
                <div
                  role='radiogroup'
                  className={styles.labelWrapper}
                  aria-labelledby={`${id}-ecl`}
                >
                  <div className={styles.label} id={`${id}-ecl`}>
                    Error resistance
                  </div>
                  <div className={styles.buttonGroup}>
                    <label
                      className={`${styles.ecl} ${
                        ecl === 'L' ? styles.eclSelected : ''
                      }`}
                    >
                      <input
                        className={`visually-hidden`}
                        type='radio'
                        name='ecl'
                        value='L'
                        checked={ecl === 'L'}
                        onChange={e => e.currentTarget.checked && setEcl('L')}
                      />
                      <span className={styles.eclLetter}>L</span>
                      <span className={styles.eclName}>Low</span>
                      <span className={styles.eclPercent}>7%</span>
                    </label>
                    <label
                      className={`${styles.ecl} ${
                        ecl === 'M' ? styles.eclSelected : ''
                      }`}
                    >
                      <input
                        className={`visually-hidden`}
                        type='radio'
                        name='ecl'
                        value='M'
                        checked={ecl === 'M'}
                        onChange={e => e.currentTarget.checked && setEcl('M')}
                      />
                      <span className={styles.eclLetter}>M</span>
                      <span className={styles.eclName}>Medium</span>
                      <span className={styles.eclPercent}>15%</span>
                    </label>
                    <label
                      className={`${styles.ecl} ${
                        ecl === 'Q' ? styles.eclSelected : ''
                      }`}
                    >
                      <input
                        className={`visually-hidden`}
                        type='radio'
                        name='ecl'
                        value='Q'
                        checked={ecl === 'Q'}
                        onChange={e => e.currentTarget.checked && setEcl('Q')}
                      />
                      <span className={styles.eclLetter}>Q</span>
                      <span className={styles.eclName}>Quartile</span>
                      <span className={styles.eclPercent}>25%</span>
                    </label>
                    <label
                      className={`${styles.ecl} ${
                        ecl === 'H' ? styles.eclSelected : ''
                      }`}
                    >
                      <input
                        className={`visually-hidden`}
                        type='radio'
                        name='ecl'
                        value='H'
                        checked={ecl === 'H'}
                        onChange={e => e.currentTarget.checked && setEcl('H')}
                      />
                      <span className={styles.eclLetter}>H</span>
                      <span className={styles.eclName}>High</span>
                      <span className={styles.eclPercent}>30%</span>
                    </label>
                  </div>
                </div>
                <label className={styles.labelWrapper}>
                  <span className={styles.label}>Export pixel size</span>
                  <input
                    type='number'
                    name='pixel-size'
                    className={styles.input}
                    value={pixelSize}
                    onChange={e => setPixelSize(e.currentTarget.value)}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      <div className={styles.qrTextWrapper}>
        <textarea
          className={styles.qrText}
          placeholder='Text or URL'
          aria-label='Text or URL to encode in QR code'
          value={text}
          onChange={e => setText(e.currentTarget.value)}
          onFocus={onUse}
        />
        <div aria-hidden className={styles.qrTextSizer}>
          {text}&nbsp;
        </div>
      </div>
    </div>
  )
}
