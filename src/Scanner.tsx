import QrScanner from './lib/qr-scanner'
import { useEffect, useRef, useState } from 'react'
import { useObjectUrl } from './lib/useObjectUrl'

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
      className='section scanner-wrapper'
      style={{ display: hidden ? 'none' : '' }}
    >
      {welcome ? <h2 className='heading'>Scan a QR code</h2> : null}
      <div className='choose'>
        <label>
          Paste, drag, or <span className='choose-file'>choose an image</span>
          <input
            type='file'
            accept='image/*'
            className='visually-hidden'
            onChange={e => {
              const file = e.currentTarget.files?.[0]
              if (file) {
                handleImage(file)
              }
            }}
          />
        </label>
        <span className='or-scan-option'>or</span>
        {media?.type === 'video' ? (
          <button
            className='scan-btn'
            onClick={() => {
              scannerRef.current?.stop()
              setMedia(null)
              setScanState({ type: 'awaiting-image', width: 0, height: 0 })
            }}
          >
            Stop scanning
          </button>
        ) : (
          <button className='scan-btn' onClick={handleStartScan}>
            Scan with camera
          </button>
        )}
      </div>
      <div
        className='height-constraint'
        style={{ display: media ? '' : 'none' }}
      >
        <div
          className='width-constraint'
          style={{ aspectRatio: `${scanState.width} / ${scanState.height}` }}
        >
          <svg
            className='selected-image'
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
                className='selected-image'
                style={{ display: media?.type === 'video' ? '' : 'none' }}
              />
            </foreignObject>
            {media?.type === 'video' ? (
              <rect
                x={media.region.x}
                y={media.region.y}
                width={media.region.width}
                height={media.region.height}
                className='scan-region'
              />
            ) : null}
            {imageUrl ? (
              <image
                href={imageUrl}
                width={scanState.width}
                height={scanState.height}
              />
            ) : null}
            {outlinePath ? (
              <>
                {media?.type === 'image' ? (
                  <path
                    d={`M 0 0 H ${scanState.width} V ${scanState.height} H 0 z ${outlinePath}`}
                    className='shadow'
                  />
                ) : null}
                <path d={outlinePath} className='shadow-outline' />
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
