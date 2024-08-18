import { create, QRCodeErrorCorrectionLevel } from 'qrcode'
import { useEffect, useId, useRef, useState } from 'react'
import * as Icon from 'react-feather'

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
      context.current.canvas.width = code.modules.size
      context.current.canvas.height = code.modules.size
      context.current.canvas.style.maxHeight = `${code.modules.size * 20}px`
      context.current.putImageData(image, 0, 0)
    } catch {
      context.current.canvas.width = 0
      context.current.canvas.height = 0
    }
  }, [text, ecl])

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
      className='section generate-wrapper'
      style={{ display: hidden ? 'none' : '' }}
    >
      {welcome ? <h2 className='heading'>Generate a QR code</h2> : null}
      {!welcome ? (
        <canvas
          className='generated-qr'
          ref={canvas => (context.current = canvas?.getContext('2d') ?? null)}
        />
      ) : null}
      {!welcome ? (
        <div
          className={`generate-btns-wrapper ${
            text === '' ? 'generate-btns-empty' : ''
          }`}
        >
          <div className='generate-btns'>
            <button
              className='generate-btn'
              onClick={async () => {
                navigator.clipboard.write([
                  new ClipboardItem({
                    'text/plain': new Blob(['todo'], { type: 'text/plain' })
                  })
                ])
              }}
              title='Copy QR code as PNG'
            >
              <Icon.Copy aria-label='Copy QR code as PNG' />
            </button>
            <div className='gen-panel-wrapper'>
              <button className='generate-btn'>
                <Icon.Download aria-label='Download as...' />
              </button>
              <div className='gen-panel downloads'>
                <button className='download-btn'>
                  <Icon.Download aria-hidden /> PNG
                </button>
                <button className='download-btn'>
                  <Icon.Download aria-hidden /> SVG
                </button>
              </div>
            </div>
            <div className='gen-panel-wrapper'>
              <button className='generate-btn'>
                <Icon.Settings aria-label='Settings' />
              </button>
              <div className='gen-panel settings'>
                <div
                  role='radiogroup'
                  className='label-wrapper'
                  aria-labelledby={`${id}-ecl`}
                >
                  <div className='label' id={`${id}-ecl`}>
                    Error resistance
                  </div>
                  <div className='button-group'>
                    <label
                      className={`ecl ${ecl === 'L' ? 'ecl-selected' : ''}`}
                    >
                      <input
                        className='visually-hidden'
                        type='radio'
                        name='ecl'
                        value='L'
                        checked={ecl === 'L'}
                        onChange={e => e.currentTarget.checked && setEcl('L')}
                      />
                      <span className='ecl-letter'>L</span>
                      <span className='ecl-name'>Low</span>
                      <span className='ecl-percent'>7%</span>
                    </label>
                    <label
                      className={`ecl ${ecl === 'M' ? 'ecl-selected' : ''}`}
                    >
                      <input
                        className='visually-hidden'
                        type='radio'
                        name='ecl'
                        value='M'
                        checked={ecl === 'M'}
                        onChange={e => e.currentTarget.checked && setEcl('M')}
                      />
                      <span className='ecl-letter'>M</span>
                      <span className='ecl-name'>Medium</span>
                      <span className='ecl-percent'>15%</span>
                    </label>
                    <label
                      className={`ecl ${ecl === 'Q' ? 'ecl-selected' : ''}`}
                    >
                      <input
                        className='visually-hidden'
                        type='radio'
                        name='ecl'
                        value='Q'
                        checked={ecl === 'Q'}
                        onChange={e => e.currentTarget.checked && setEcl('Q')}
                      />
                      <span className='ecl-letter'>Q</span>
                      <span className='ecl-name'>Quartile</span>
                      <span className='ecl-percent'>25%</span>
                    </label>
                    <label
                      className={`ecl ${ecl === 'H' ? 'ecl-selected' : ''}`}
                    >
                      <input
                        className='visually-hidden'
                        type='radio'
                        name='ecl'
                        value='H'
                        checked={ecl === 'H'}
                        onChange={e => e.currentTarget.checked && setEcl('H')}
                      />
                      <span className='ecl-letter'>H</span>
                      <span className='ecl-name'>High</span>
                      <span className='ecl-percent'>30%</span>
                    </label>
                  </div>
                </div>
                <label className='label-wrapper'>
                  <span className='label'>Export pixel size</span>
                  <input
                    type='number'
                    name='pixel-size'
                    className='input'
                    value={pixelSize}
                    onChange={e => setPixelSize(e.currentTarget.value)}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      <div className='qr-text-wrapper'>
        <textarea
          className='qr-text'
          placeholder='Text or URL'
          aria-label='Text or URL to encode in QR code'
          value={text}
          onChange={e => setText(e.currentTarget.value)}
          onFocus={onUse}
        />
        <div aria-hidden className='qr-text-sizer'>
          {text}&nbsp;
        </div>
      </div>
    </div>
  )
}
