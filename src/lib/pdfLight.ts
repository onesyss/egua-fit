import { useEffect, useState } from 'react'

let printing = false
const listeners = new Set<() => void>()

export function setPdfLight(next: boolean) {
  printing = next
  listeners.forEach((listener) => listener())
}

export function usePdfLight() {
  const [on, setOn] = useState(printing)
  useEffect(() => {
    const listener = () => setOn(printing)
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])
  return on
}
