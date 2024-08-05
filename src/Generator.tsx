import { create } from 'qrcode'
import { useEffect, useState } from 'react'

export type GeneratorProps = {
  welcome: boolean
}
export function Generator ({ welcome }: GeneratorProps) {
  const [text, setText] = useState('')
  const [result, setResult] = useState('')

  useEffect(() => {
    if (text) {
      const code = create(text)
      setResult(
        Array.from(
          code.modules.data,
          (bit, i) =>
            (i % code.modules.size === 0 ? '\n' : '') + (bit ? '█' : ' ')
        ).join('')
      )
    }
  }, [text])

  return (
    <div>
      <pre style={{ lineHeight: '1' }}>{result}</pre>
      <textarea
        aria-label='Text or URL to encode in QR code'
        value={text}
        onChange={e => setText(e.currentTarget.value)}
      />
    </div>
  )
}
