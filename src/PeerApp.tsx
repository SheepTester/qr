import { PointerEvent, useEffect, useRef, useState } from 'react'
import './global.css'
import styles from './PeerApp.module.css'
import { useQr, UseQrOptions } from './generator/useQr'

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

const qrOptions: UseQrOptions = { className: styles.generatedQr }

export function PeerApp () {
  const [x, setX] = useState(0.5)
  const [y, setY] = useState(0.5)
  const dragStateRef = useRef<DragState | null>(null)
  const [text, setText] = useState('hello')

  useEffect(() => {
    let frameId = 0
    const frame = () => {
      setText(String(Math.floor(Date.now() / 1000)))
      frameId = window.requestAnimationFrame(frame)
    }
    frame()
    return () => {
      window.cancelAnimationFrame(frameId)
    }
  }, [])

  const handlePointerEnd = (e: PointerEvent) => {
    if (dragStateRef.current?.pointerId === e.pointerId) {
      dragStateRef.current = null
    }
  }

  const { canvas } = useQr(text, qrOptions)

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
        <div className={styles.verticalSquarer}>{canvas}</div>
      </div>
    </div>
  )
}
