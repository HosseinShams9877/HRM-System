'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface UseApiOptions<T> {
  /** URL to fetch from */
  url: string
  /** Auto-fetch on mount (default: true) */
  autoFetch?: boolean
  /** Refresh interval in ms (0 = disabled) */
  refreshInterval?: number
  /** Initial data */
  initialData?: T
  /** Transform response data */
  transform?: (data: unknown) => T
}

interface UseApiReturn<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Custom hook for data fetching with:
 * - Loading/error states
 * - Auto-refresh
 * - Deduplication of concurrent requests
 * - Transform support
 */
export function useApi<T = unknown>(options: UseApiOptions<T>): UseApiReturn<T> {
  const { url, autoFetch = true, refreshInterval = 0, initialData, transform } = options

  const [data, setData] = useState<T | null>(initialData ?? null)
  const [loading, setLoading] = useState(autoFetch)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const fetchData = useCallback(async () => {
    // Cancel previous request
    if (abortRef.current) {
      abortRef.current.abort()
    }
    const controller = new AbortController()
    abortRef.current = controller

    try {
      setLoading(true)
      setError(null)

      const res = await fetch(url, { signal: controller.signal })
      
      if (controller.signal.aborted) return

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || `خطای سرور (${res.status})`)
      }

      const json = await res.json()
      const transformed = transform ? transform(json) : json
      setData(transformed as T)
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      setError(err instanceof Error ? err.message : 'خطای ناشناخته')
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false)
      }
    }
  }, [url, transform])

  useEffect(() => {
    if (autoFetch) {
      fetchData()
    }
  }, [autoFetch, fetchData])

  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [refreshInterval, fetchData])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortRef.current) {
        abortRef.current.abort()
      }
    }
  }, [])

  return { data, loading, error, refetch: fetchData }
}
