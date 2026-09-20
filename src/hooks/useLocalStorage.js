import { useEffect, useState } from 'react'

/**
 * useState that mirrors its value into localStorage.
 * `initialValue` may be a value or a lazy factory function.
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => readStoredValue(key, initialValue))

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Storage can be unavailable (private mode, quota) - the app still works in memory.
    }
  }, [key, value])

  return [value, setValue]
}

function readStoredValue(key, initialValue) {
  const fallback = () => (typeof initialValue === 'function' ? initialValue() : initialValue)

  try {
    const raw = window.localStorage.getItem(key)
    return raw === null ? fallback() : JSON.parse(raw)
  } catch {
    return fallback()
  }
}
