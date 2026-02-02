import { useRef, useState } from 'react'
import * as Icon from 'react-feather'
import styles from './GenerateButtons.module.css'
import { GenerateOptions, GenerateOptionsProps } from './GenerateOptions'

export type GenerateButtonsProps = GenerateOptionsProps & {
  onCopyPng: () => void | PromiseLike<void>
  onDownloadPng: () => void
  onDownloadSvg: () => void
  hidden?: boolean
}
export function GenerateButtons ({
  onCopyPng,
  onDownloadPng,
  onDownloadSvg,
  hidden,
  ...genOptProps
}: GenerateButtonsProps) {
  const [copied, setCopied] = useState(false)
  const copyTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const CopyIcon = copied ? Icon.Check : Icon.Copy

  return (
    <div
      className={`${styles.generateBtnsWrapper} ${
        hidden ? styles.generateBtnsEmpty : ''
      }`}
    >
      <div className={styles.generateBtns}>
        <button
          className={styles.generateBtn}
          onClick={async () => {
            setCopied(false)
            if (copyTimeout.current !== null) {
              clearTimeout(copyTimeout.current)
            }
            await onCopyPng()
            setCopied(true)
            copyTimeout.current = setTimeout(() => {
              setCopied(false)
              copyTimeout.current = null
            }, 500)
          }}
          title='Copy QR code as PNG'
        >
          <CopyIcon aria-label='Copy QR code as PNG' />
        </button>
        <div className={styles.genPanelWrapper}>
          <button className={styles.generateBtn}>
            <Icon.Download aria-label='Download as...' />
          </button>
          <div className={`${styles.genPanel} ${styles.downloads}`}>
            <button className={styles.downloadBtn} onClick={onDownloadPng}>
              <Icon.Download aria-hidden /> PNG
            </button>
            <button className={styles.downloadBtn} onClick={onDownloadSvg}>
              <Icon.Download aria-hidden /> SVG
            </button>
          </div>
        </div>
        <div className={styles.genPanelWrapper}>
          <button className={styles.generateBtn}>
            <Icon.Settings aria-label='Settings' />
          </button>
          <div className={`${styles.genPanel} ${styles.settings}`}>
            <GenerateOptions {...genOptProps} />
          </div>
        </div>
      </div>
    </div>
  )
}
