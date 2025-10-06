import { useEffect, useRef, useState } from 'react'
import common from '../common.module.css'
import QrScanner from '../lib/qr-scanner'
import { useObjectUrl } from '../lib/useObjectUrl'
import styles from './index.module.css'

type ScanState =
  | {
      width: number
      height: number
    } & (
      | { type: 'awaiting-image' | 'scanning' | 'no-result' }
      | ({ type: 'result'; mirrored?: boolean } & QrScanner.ScanResult)
    )
type SelectedMedia =
  | { type: 'image'; image: Blob }
  | { type: 'video'; region: QrScanner.ScanRegion }

export type ScannerProps = {
  welcome: boolean
  hidden: boolean
  onUse: () => void
}
export function Scanner ({ welcome, hidden, onUse }: ScannerProps) {
  const [media, setMedia] = useState<SelectedMedia | null>(null)
  const imageUrl = useObjectUrl(media?.type === 'image' ? media.image : null)
  const [scanState, setScanState] = useState<ScanState>({
    type: 'awaiting-image',
    width: 0,
    height: 0
  })
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const scannerRef = useRef<QrScanner | null>(null)
  const [dragOver, setDragOver] = useState(false)

  async function handleImage (blob: Blob): Promise<void> {
    onUse()
    const bitmap = await createImageBitmap(blob)
    setMedia({ type: 'image', image: blob })
    setScanState({
      type: 'scanning',
      width: bitmap.width,
      height: bitmap.height
    })
    scannerRef.current?.stop()
    try {
      const result = await QrScanner.scanImage(bitmap, {
        returnDetailedScanResult: true
      })
      setScanState({
        ...result,
        type: 'result',
        width: bitmap.width,
        height: bitmap.height
      })
      bitmap.close()
    } catch (error) {
      console.error(error)
      setScanState({
        type: 'no-result',
        width: bitmap.width,
        height: bitmap.height
      })
    }
  }

  function handleResult (result: QrScanner.ScanResult): void {
    setScanState(scanState => ({
      ...scanState,
      ...result,
      type: 'result',
      mirrored: scannerRef.current?.isVideoMirrored()
    }))
  }

  async function handleStartScan (): Promise<void> {
    const video = videoRef.current
    if (!video) {
      return
    }
    scannerRef.current ??= new QrScanner(video, handleResult, {
      returnDetailedScanResult: true
    })
    await scannerRef.current.start()
    setScanState({
      type: 'scanning',
      width: video.videoWidth,
      height: video.videoHeight
    })
    setMedia({ type: 'video', region: scannerRef.current.scanRegion })
    onUse()
  }

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const image = Array.from(e.clipboardData?.items ?? [])
        .find(item => item.type.startsWith('image/'))
        ?.getAsFile()
      if (image) {
        handleImage(image)
      }
    }
    document.addEventListener('paste', handlePaste)
    return () => {
      document.removeEventListener('paste', handlePaste)
    }
  }, [])

  const outlinePath =
    scanState.type === 'result'
      ? `${scanState.cornerPoints
          .map(
            ({ x, y }, i) =>
              `${i === 0 ? 'M' : 'L'} ${
                scanState.mirrored ? scanState.width - x : x
              } ${y}`
          )
          .join('')}z`
      : null

  return (
    <div
      className={`${common.section} ${styles.scannerWrapper}`}
      style={{ display: hidden ? 'none' : '' }}
      onDragOver={e => {
        e.dataTransfer.dropEffect = 'copy'
        setDragOver(true)
        e.preventDefault()
      }}
      onDragLeave={() => setDragOver(false)}
    >
      {welcome ? <h2 className={common.heading}>Scan a QR code</h2> : null}
      <div className={styles.choose}>
        <label>
          Paste, drag, or{' '}
          <span className={styles.chooseFile}>choose an image</span>
          <input
            type='file'
            accept='image/*'
            className={common.visuallyHidden}
            onChange={e => {
              const file = e.currentTarget.files?.[0]
              if (file) {
                handleImage(file)
              }
            }}
          />
        </label>
        <span className={styles.orScanOption}>or</span>
        {media?.type === 'video' ? (
          <button
            className={styles.scanBtn}
            onClick={() => {
              scannerRef.current?.stop()
              setMedia(null)
              setScanState({ type: 'awaiting-image', width: 0, height: 0 })
            }}
          >
            Stop scanning
          </button>
        ) : (
          <button className={styles.scanBtn} onClick={handleStartScan}>
            Scan with camera
          </button>
        )}
      </div>
      <div
        className={styles.heightConstraint}
        style={{ display: media ? '' : 'none' }}
      >
        <div
          className={styles.widthConstraint}
          style={{ aspectRatio: `${scanState.width} / ${scanState.height}` }}
        >
          <svg
            className={styles.selectedImage}
            viewBox={`0 0 ${scanState.width} ${scanState.height}`}
          >
            <foreignObject
              x={0}
              y={0}
              width={scanState.width}
              height={scanState.height}
            >
              <video
                ref={videoRef}
                style={{ display: media?.type === 'video' ? '' : 'none' }}
              />
            </foreignObject>
            {media?.type === 'video' ? (
              <rect
                x={media.region.x}
                y={media.region.y}
                width={media.region.width}
                height={media.region.height}
                className={styles.scanRegion}
              />
            ) : null}
            {imageUrl ? (
              <image
                href={imageUrl}
                x={0}
                y={0}
                width={scanState.width}
                height={scanState.height}
              />
            ) : null}
            {outlinePath ? (
              <>
                {media?.type === 'image' ? (
                  <path
                    d={`M 0 0 H ${scanState.width} V ${scanState.height} H 0 z ${outlinePath}`}
                    className={styles.shadow}
                  />
                ) : null}
                <path d={outlinePath} className={styles.shadowOutline} />
              </>
            ) : null}
          </svg>
        </div>
      </div>
      <div>
        {scanState.type === 'scanning'
          ? 'Loading...'
          : scanState.type === 'no-result'
          ? 'No QR code found.'
          : scanState.type === 'result'
          ? scanState.data
          : null}
      </div>
    </div>
  )
}
