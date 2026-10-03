import * as Icon from 'react-feather'
import styles from './QrText.module.css'

export type QrTextProps = {
  text: string
  onText: (text: string) => void
}
export function QrText ({ text, onText }: QrTextProps) {
  return (
    <div className={styles.row}>
      <div className={styles.qrTextWrapper}>
        <textarea
          className={styles.qrText}
          placeholder='Text or URL'
          aria-label='Text or URL to encode in QR code'
          value={text}
          onChange={e => onText(e.currentTarget.value)}
        />
        <div aria-hidden className={styles.qrTextSizer}>
          {text}&nbsp;
        </div>
      </div>
      {text === '' ? (
        <button
          className={styles.pasteBtn}
          onClick={() => navigator.clipboard.readText().then(onText)}
          title='Paste'
        >
          <Icon.Clipboard aria-label='Paste' />
        </button>
      ) : null}
    </div>
  )
}
