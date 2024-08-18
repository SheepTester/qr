import QrScanner from 'qr-scanner'
import { useEffect, useRef, useState } from 'react'
import { useObjectUrl } from './lib/useObjectUrl'

type ScanState =
  | { type: 'awaiting-image' }
  | {
      type: 'scanning' | 'no-result'
      width: number
      height: number
    }
  | (QrScanner.ScanResult & {
      type: 'result'
      width: number
      height: number
    })
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
  const [image, setImage] = useState<Blob | null>(null)
  const imageUrl = useObjectUrl(image)
  const [scanState, setScanState] = useState<ScanState>({
    type: 'awaiting-image'
  })
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const scannerRef = useRef<QrScanner | null>(null)
  const [usingCamera, setUsingCamera] = useState<Camera | null>(null)

  async function handleImage (blob: Blob): Promise<void> {
    onUse()
    const bitmap = await createImageBitmap(blob)
    setImage(blob)
    setScanState({
      type: 'scanning',
      width: bitmap.width,
      height: bitmap.height
    })
    setUsingCamera(null)
    scannerRef.current?.stop()
    scannerRef.current = null
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
      <button
        onClick={() => {
          const video = videoRef.current
          if (video) {
            scannerRef.current = new QrScanner(video, console.log, {
              returnDetailedScanResult: true
            })
            scannerRef.current.start().then(() => {
              console.log(video.videoWidth)
              setUsingCamera({
                width: video.videoWidth,
                height: video.videoHeight
              })
              onUse()
            })
            console.log(scannerRef.current)
          }
        }}
      >
        Scan with camera
      </button>
      <div
        className='height-constraint'
        style={{ display: welcome ? 'none' : '' }}
      >
        <div
          className='width-constraint'
          style={{
            aspectRatio: usingCamera
              ? `${usingCamera.width} / ${usingCamera.height}`
              : scanState.type !== 'awaiting-image'
              ? `${scanState.width} / ${scanState.height}`
              : ''
          }}
        >
          <video
            ref={videoRef}
            className='selected-image'
            style={{ display: usingCamera ? '' : 'none' }}
          />
          {imageUrl && !usingCamera && scanState.type !== 'awaiting-image' ? (
            <svg
              className='selected-image'
              viewBox={`0 0 ${scanState.width} ${scanState.height}`}
            >
              <image
                href={imageUrl}
                width={scanState.width}
                height={scanState.height}
              />
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
          ) : null}
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
