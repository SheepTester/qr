import { PointerEvent, useEffect, useMemo, useRef, useState } from 'react'
import './global.css'
import styles from './PeerApp.module.css'
import { create } from 'qrcode'
import { QUIET_ZONE } from './lib/constants'

type DragState = {
  initX: number
  initY: number
  initClientX: number
  initClientY: number
  pointerId: number
}

const MIN_MARGIN = 0.05
const clamp = (value: number) =>
  Math.max(Math.min(value, 1 - MIN_MARGIN), MIN_MARGIN)

export function PeerApp () {
  const [x, setX] = useState(0.5)
  const [y, setY] = useState(0.5)
  const dragStateRef = useRef<DragState | null>(null)
  const context = useRef<CanvasRenderingContext2D | null>(null)

  const handlePointerEnd = (e: PointerEvent) => {
    if (dragStateRef.current?.pointerId === e.pointerId) {
      dragStateRef.current = null
    }
  }

  // TODO: Make this a shared hook/component
  const text = 'hello'
  const code = useMemo(() => {
    try {
      return create(text, { errorCorrectionLevel: 'low' })
    } catch (error) {
      console.error('QR code creation error', error)
      return null
    }
  }, [text])

  useEffect(() => {
    if (!context.current || !code) {
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

  return (
    <div
      className={styles.qrWrapper}
      style={{
        left: `${Math.max(0, 1 - (1 - x) * 2) * 100}%`,
        right: `${Math.max(0, 1 - x * 2) * 100}%`,
        top: `${Math.max(0, 1 - (1 - y) * 2) * 100}%`,
        bottom: `${Math.max(0, 1 - y * 2) * 100}%`
      }}
      onPointerDown={e => {
        if (!dragStateRef.current) {
          e.currentTarget.setPointerCapture(e.pointerId)
          dragStateRef.current = {
            initX: x,
            initY: y,
            initClientX: e.clientX,
            initClientY: e.clientY,
            pointerId: e.pointerId
          }
        }
      }}
      onPointerMove={e => {
        if (dragStateRef.current?.pointerId === e.pointerId) {
          const x =
            (e.clientX - dragStateRef.current.initClientX) / window.innerWidth
          const y =
            (e.clientY - dragStateRef.current.initClientY) / window.innerHeight
          setX(clamp(x + dragStateRef.current.initX))
          setY(clamp(y + dragStateRef.current.initY))
        }
      }}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
    >
      <div className={styles.horizontalSquarer}>
        <div className={styles.verticalSquarer}>
          <canvas
            className={styles.generatedQr}
            ref={canvas => (context.current = canvas?.getContext('2d') ?? null)}
          />
        </div>
      </div>
    </div>
  )
}
