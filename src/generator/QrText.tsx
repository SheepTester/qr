import styles from './QrText.module.css'

export type QrTextProps = {
  text: string
  onText: (text: string) => void
  onFocus: () => void
}
export function QrText ({ text, onText, onFocus }: QrTextProps) {
  return (
    <div className={styles.qrTextWrapper}>
      <textarea
        className={styles.qrText}
        placeholder='Text or URL'
        aria-label='Text or URL to encode in QR code'
        value={text}
        onChange={e => onText(e.currentTarget.value)}
        onFocus={onFocus}
      />
      <div aria-hidden className={styles.qrTextSizer}>
        {text}&nbsp;
      </div>
    </div>
  )
}
