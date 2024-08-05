import { useRef } from 'react'

export function useObjectUrl (blob?: Blob | null): string | null {
  const prevBlob = useRef<Blob | null>(null)
  const prevUrl = useRef<string | null>(null)
  if (blob !== prevBlob.current) {
    prevBlob.current = blob ?? null
    if (prevUrl.current) {
      URL.revokeObjectURL(prevUrl.current)
    }
    prevUrl.current = blob ? URL.createObjectURL(blob) : null
  }
  return prevUrl.current
}
