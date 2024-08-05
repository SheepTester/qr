import QrScanner from 'qr-scanner'
import { useEffect, useState } from 'react'
import { useObjectUrl } from './lib/useObjectUrl'

type ScanState =
  | { type: 'awaiting-image' | 'scanning' | 'no-result' }
  | (QrScanner.ScanResult & {
      type: 'result'
      width: number
      height: number
    })

export type ScannerProps = {
  welcome: boolean
}
export function Scanner ({ welcome }: ScannerProps) {
  const [image, setImage] = useState<Blob | null>(null)
  const imageUrl = useObjectUrl(image)
  const [scanState, setScanState] = useState<ScanState>({
    type: 'awaiting-image'
  })

  async function handleImage (blob: Blob): Promise<void> {
    setImage(blob)
    setScanState({ type: 'scanning' })
    try {
      const bitmap = await createImageBitmap(blob)
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
    } catch {
      setScanState({ type: 'no-result' })
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
    <div>
      <div>
        <label>
          Paste, drag, or <span>choose an image</span>
          <input type='file' accept='image/*' />
        </label>
        {imageUrl ? (
          scanState.type === 'result' ? (
            <svg width={scanState.width} height={scanState.height}>
              <image
                href={imageUrl}
                width={scanState.width}
                height={scanState.height}
              />
              <path
                d={
                  scanState.cornerPoints
                    .map(({ x, y }, i) => `${i === 0 ? 'M' : 'L'} ${x} ${y}`)
                    .join('') + 'z'
                }
              />
            </svg>
          ) : (
            <img src={imageUrl} alt='Selected image' />
          )
        ) : null}
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
