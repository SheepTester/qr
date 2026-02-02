import { PointerEvent, useEffect, useRef, useState } from 'react'
import { useQr, UseQrOptions } from './generator/useQr'
import './global.css'
import styles from './PeerApp.module.css'
import { CameraSelect } from './scanner/CameraSelect'
import QrScanner from './scanner/qr-scanner'

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
  const [y, setY] = useState(0.25)
  const dragStateRef = useRef<DragState | null>(null)
  const [text, setText] = useState('hello')

  const [scanning, setScanning] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const scannerRef = useRef<QrScanner | null>(null)

  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [preferredCamera, setPreferredCamera] = useState('user')
  useEffect(() => {
    navigator.mediaDevices
      .enumerateDevices()
      .then(devices =>
        setDevices(
          devices.filter(
            device => device.deviceId && device.kind === 'videoinput'
          )
        )
      )
  }, [])

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

  const handleResult = (result: QrScanner.ScanResult) => {
    console.log(result)
  }

  return (
    <>
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
              (e.clientY - dragStateRef.current.initClientY) /
              window.innerHeight
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
      <video ref={videoRef} />
      <div className={styles.cameraBar}>
        {scanning ? (
          <button
            onClick={() => {
              scannerRef.current?.stop()
              setScanning(false)
            }}
          >
            Stop
          </button>
        ) : (
          <button
            onClick={async () => {
              const video = videoRef.current
              if (!video) {
                return
              }
              setScanning(true)
              try {
                scannerRef.current ??= new QrScanner(video, handleResult, {
                  returnDetailedScanResult: true,
                  preferredCamera,
                  calculateScanRegion: video => {
                    const smallestDimension = Math.min(
                      video.videoWidth,
                      video.videoHeight
                    )
                    return {
                      x: Math.round((video.videoWidth - smallestDimension) / 2),
                      y: Math.round(
                        (video.videoHeight - smallestDimension) / 2
                      ),
                      width: smallestDimension,
                      height: smallestDimension
                    }
                  }
                })
                await scannerRef.current.start()
                setDevices(
                  (await navigator.mediaDevices.enumerateDevices()).filter(
                    device => device.deviceId && device.kind === 'videoinput'
                  )
                )
              } catch (error) {
                setScanning(false)
                console.error('failed to start scanning', error)
              }
            }}
          >
            Start
          </button>
        )}
        <CameraSelect
          cameras={devices}
          cameraId={preferredCamera}
          onCamera={async cameraId => {
            setPreferredCamera(cameraId)
            const scanner = scannerRef.current
            const video = videoRef.current
            if (scanner && video) {
              await scanner.setCamera(cameraId)
            }
          }}
        />
      </div>
    </>
  )
}
