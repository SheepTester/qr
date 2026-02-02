import { create, QRCode, QRCodeOptions, QRCodeSegment } from 'qrcode'
import { ReactNode, useEffect, useMemo, useRef } from 'react'
import styles from './useQr.module.css'

/** Modules (pixels) of quiet zone (whitespace) around the QR code */
const QUIET_ZONE = 4

export type UseQrOptions = QRCodeOptions & { className?: string }
export type QrCodeOrError =
  | (QRCode & { error?: undefined })
  | { error: 'empty' | 'too-big' | 'unknown' }
export type QrResult = {
  code: QrCodeOrError
  canvas: ReactNode
}
export function useQr (
  text: string | QRCodeSegment[],
  options?: UseQrOptions
): QrResult {
  const context = useRef<CanvasRenderingContext2D | null>(null)

  const code = useMemo<QrCodeOrError>(() => {
    try {
      return create(text, options)
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'No input text') {
          return { error: 'empty' }
        }
        if (
          error.message ===
          'The amount of data is too big to be stored in a QR Code'
        ) {
          return { error: 'too-big' }
        }
      }
      console.error('Unknown QR code creation error', error)
      return { error: 'unknown' }
    }
  }, [text, options])

  useEffect(() => {
    if (!context.current) {
      return
    }
    if (code.error) {
      context.current.canvas.width = 0
      context.current.canvas.height = 0
      return
    }
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
    context.current.putImageData(image, QUIET_ZONE, QUIET_ZONE)
  }, [code])

  return {
    code,
    canvas: (
      <canvas
        className={`${styles.qr} ${options?.className ?? ''}`}
        ref={canvas => (context.current = canvas?.getContext('2d') ?? null)}
      />
    )
  }
}
