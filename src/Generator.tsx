import { create } from 'qrcode'
import { useEffect, useRef, useState } from 'react'

export type GeneratorProps = {
  welcome: boolean
  hidden: boolean
  onUse: () => void
}
export function Generator ({ welcome, hidden, onUse }: GeneratorProps) {
  const [text, setText] = useState('')
  const context = useRef<CanvasRenderingContext2D | null>(null)

  useEffect(() => {
    if (!context.current) {
      return
    }
    try {
      const code = create(text)
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
  }, [text])

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
