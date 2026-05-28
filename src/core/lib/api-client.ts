/**
 * apiClient — Professional typed API client for the HR system.
 *
 * Provides:
 *  - Consistent error handling
 *  - Automatic JSON parsing
 *  - Type-safe responses
 *  - Standard error format
 */

// ---- Standard API Response Types ----

export interface ApiSuccessResponse<T> {
  success: true
  data: T
  message?: string
  pagination?: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export interface ApiErrorResponse {
  success: false
  error: string
  details?: Record<string, string[]>
  statusCode: number
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

// ---- API Error class ----

export class ApiError extends Error {
  statusCode: number
  details?: Record<string, string[]>

  constructor(message: string, statusCode: number, details?: Record<string, string[]>) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.details = details
  }
}

// ---- Helper to check response type ----

export function isApiSuccess<T>(res: ApiResponse<T>): res is ApiSuccessResponse<T> {
  return res.success === true
}

export function isApiError<T>(res: ApiResponse<T>): res is ApiErrorResponse {
  return res.success === false
}

// ---- Fetch wrapper ----

interface FetchOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  /** Timeout in milliseconds (default: 30000) */
  timeout?: number
}

async function fetchWithTimeout(url: string, options: FetchOptions = {}): Promise<Response> {
  const { timeout = 30000, body, headers: customHeaders, ...rest } = options

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...(customHeaders as Record<string, string> || {}),
  }

  let serializedBody: string | undefined
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    serializedBody = JSON.stringify(body)
  }

  try {
    const response = await fetch(url, {
      ...rest,
      headers,
      body: serializedBody,
      signal: controller.signal,
    })
    return response
  } finally {
    clearTimeout(timeoutId)
  }
}

// ---- Parse response ----

async function parseResponse<T>(response: Response): Promise<ApiResponse<T>> {
  // Try to parse JSON
  let json: unknown
  try {
    json = await response.json()
  } catch {
    return {
      success: false,
      error: response.statusText || 'خطای سرور',
      statusCode: response.status,
    }
  }

  // If server already returns our standard format
  if (json && typeof json === 'object' && 'success' in json) {
    return json as ApiResponse<T>
  }

  // Legacy format — wrap in standard response
  if (response.ok) {
    return {
      success: true,
      data: json as T,
    }
  }

  // Error from legacy format
  const errorObj = json as Record<string, unknown>
  return {
    success: false,
    error: (errorObj.error as string) || response.statusText || 'خطای ناشناخته',
    statusCode: response.status,
    details: errorObj.details as Record<string, string[]> | undefined,
  }
}

// ---- Main API client methods ----

export const apiClient = {
  /**
   * GET request
   */
  async get<T>(url: string, options?: FetchOptions): Promise<ApiResponse<T>> {
    try {
      const response = await fetchWithTimeout(url, { ...options, method: 'GET' })
      return parseResponse<T>(response)
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return { success: false, error: 'درخواست زمان‌بر شد. لطفاً دوباره تلاش کنید.', statusCode: 408 }
      }
      return { success: false, error: 'خطا در ارتباط با سرور', statusCode: 0 }
    }
  },

  /**
   * POST request
   */
  async post<T>(url: string, body?: unknown, options?: FetchOptions): Promise<ApiResponse<T>> {
    try {
      const response = await fetchWithTimeout(url, { ...options, method: 'POST', body })
      return parseResponse<T>(response)
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return { success: false, error: 'درخواست زمان‌بر شد. لطفاً دوباره تلاش کنید.', statusCode: 408 }
      }
      return { success: false, error: 'خطا در ارتباط با سرور', statusCode: 0 }
    }
  },

  /**
   * PUT request
   */
  async put<T>(url: string, body?: unknown, options?: FetchOptions): Promise<ApiResponse<T>> {
    try {
      const response = await fetchWithTimeout(url, { ...options, method: 'PUT', body })
      return parseResponse<T>(response)
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return { success: false, error: 'درخواست زمان‌بر شد. لطفاً دوباره تلاش کنید.', statusCode: 408 }
      }
      return { success: false, error: 'خطا در ارتباط با سرور', statusCode: 0 }
    }
  },

  /**
   * DELETE request
   */
  async delete<T = void>(url: string, options?: FetchOptions): Promise<ApiResponse<T>> {
    try {
      const response = await fetchWithTimeout(url, { ...options, method: 'DELETE' })
      return parseResponse<T>(response)
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return { success: false, error: 'درخواست زمان‌بر شد. لطفاً دوباره تلاش کنید.', statusCode: 408 }
      }
      return { success: false, error: 'خطا در ارتباط با سرور', statusCode: 0 }
    }
  },
}

// ---- Hook helper for API calls with loading/error state ----

import { useState, useCallback } from 'react'

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

interface UseApiResult<T> extends UseApiState<T> {
  execute: (...args: unknown[]) => Promise<ApiResponse<T>>
  reset: () => void
}

export function useApi<T>(
  apiFn: (...args: unknown[]) => Promise<ApiResponse<T>>,
  initialValue: T | null = null,
): UseApiResult<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: initialValue,
    loading: false,
    error: null,
  })

  const execute = useCallback(async (...args: unknown[]) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    const result = await apiFn(...args)
    if (isApiSuccess(result)) {
      setState({ data: result.data, loading: false, error: null })
    } else {
      setState(prev => ({ ...prev, loading: false, error: result.error }))
    }
    return result
  }, [apiFn])

  const reset = useCallback(() => {
    setState({ data: initialValue, loading: false, error: null })
  }, [initialValue])

  return { ...state, execute, reset }
}
