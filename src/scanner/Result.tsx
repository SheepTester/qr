import { useRef, useState } from 'react'
import * as Icon from 'react-feather'
import styles from './Result.module.css'

export type ResultProps = {
  text: string
}
export function Result ({ text }: ResultProps) {
  const [copied, setCopied] = useState(false)
  const copyTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const url = getUrl(text)

  const CopyIcon = copied ? Icon.Check : Icon.Copy
  const Component = url ? 'a' : 'span'

  return (
    <div className={styles.result}>
      <Component
        className={styles.text}
        href={url ?? undefined}
        target='_blank'
      >
        {text}
      </Component>
      <button
        className={styles.button}
        onClick={async () => {
          setCopied(false)
          if (copyTimeout.current !== null) {
            clearTimeout(copyTimeout.current)
          }
          await navigator.clipboard.writeText(text)
          setCopied(true)
          copyTimeout.current = setTimeout(() => {
            setCopied(false)
            copyTimeout.current = null
          }, 500)
        }}
        title='Copy'
      >
        <CopyIcon aria-label='Copy to clipboard' />
      </button>
    </div>
  )
}

/**
 * Retrieves a URI from the raw string if possible. Tries to mimic the behavior
 * of the QR code scanner on my phone.
 */
function getUrl (text: string): string | null {
  text = text.trim()
  if (text.match(/[a-z]+:/i)) {
    return text
  }
  if (text.match(/(?:[a-z]+\.)+[a-z]+(\/|$)/i)) {
    return `http://${text}`
  }
  return null
}
