import QrScanner from './lib/qr-scanner'
import { useEffect, useRef, useState } from 'react'
import { useObjectUrl } from './lib/useObjectUrl'

type ScanState =
  | {
      width: number
      height: number
    } & (
      | { type: 'awaiting-image' | 'scanning' | 'no-result' }
      | ({ type: 'result' } & QrScanner.ScanResult)
    )
type Camera = {
  width: number
  height: number
}

export type ScannerProps = {
  welcome: boolean
  hidden: boolean
  onUse: () => void
}
export function Scanner ({ welcome, hidden, onUse }: ScannerProps) {
  const [image, setImage] = useState<Blob | 'video' | null>(null)
  const imageUrl = useObjectUrl(image === 'video' ? null : image)
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
    setImage(blob)
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
      type: 'result'
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
    setImage('video')
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

  return (
    <div
      className='section scanner-wrapper'
      style={{ display: hidden ? 'none' : '' }}
    >
      {welcome ? <h2 className='heading'>Scan a QR code</h2> : null}
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
      <button onClick={handleStartScan}>Scan with camera</button>
      <div
        className='height-constraint'
        style={{ display: welcome ? 'none' : '' }}
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
                style={{ display: image === 'video' ? '' : 'none' }}
              />
            </foreignObject>
            {imageUrl ? (
              <image
                href={imageUrl}
                width={scanState.width}
                height={scanState.height}
              />
            ) : null}
            {scanState.type === 'result' ? (
              <>
                <path
                  d={`M 0 0 H ${scanState.width} V ${
                    scanState.height
                  } H 0 z ${scanState.cornerPoints
                    .map(({ x, y }, i) => `${i === 0 ? 'M' : 'L'} ${x} ${y}`)
                    .join('')}z`}
                  className='shadow'
                />
                <path
                  d={`${scanState.cornerPoints
                    .map(({ x, y }, i) => `${i === 0 ? 'M' : 'L'} ${x} ${y}`)
                    .join('')}z`}
                  className='shadow-outline'
                />
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
