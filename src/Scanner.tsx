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
  hidden: boolean
  onUse: () => void
}
export function Scanner ({ welcome, hidden, onUse }: ScannerProps) {
  const [image, setImage] = useState<Blob | null>(null)
  const imageUrl = useObjectUrl(image)
  const [scanState, setScanState] = useState<ScanState>({
    type: 'awaiting-image'
  })

  async function handleImage (blob: Blob): Promise<void> {
    onUse()
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
      {imageUrl ? (
        scanState.type === 'result' ? (
          <svg
            width={scanState.width}
            height={scanState.height}
            viewBox={`0 0 ${scanState.width} ${scanState.height}`}
            className='selected-image'
          >
            <image
              href={imageUrl}
              width={scanState.width}
              height={scanState.height}
            />
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
          </svg>
        ) : (
          <img src={imageUrl} alt='Selected image' className='selected-image' />
        )
      ) : null}
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
