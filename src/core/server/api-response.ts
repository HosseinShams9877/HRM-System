/**
 * api-response.ts — Standard API response helpers for backend routes.
 *
 * All API routes should use these helpers to ensure consistent
 * response format across the entire application.
 *
 * Usage in route.ts:
 *   return apiSuccess(data, 'عملیات با موفقیت انجام شد')
 *   return apiError('کارمند یافت نشد', 404)
 *   return apiValidationError({ email: ['ایمیل نامعتبر است'] })
 */

import { NextResponse } from 'next/server'

// ---- Types ----

interface SuccessResponse<T> {
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

interface ErrorResponse {
  success: false
  error: string
  details?: Record<string, string[]>
  statusCode: number
}

// ---- Success Responses ----

export function apiSuccess<T>(data: T, message?: string, status = 200): NextResponse<SuccessResponse<T>> {
  const response: SuccessResponse<T> = { success: true, data }
  if (message) response.message = message
  return NextResponse.json(response, { status })
}

export function apiSuccessWithPagination<T>(
  data: T,
  pagination: { page: number; pageSize: number; total: number },
  message?: string,
): NextResponse<SuccessResponse<T>> {
  const response: SuccessResponse<T> = {
    success: true,
    data,
    pagination: {
      page: pagination.page,
      pageSize: pagination.pageSize,
      total: pagination.total,
      totalPages: Math.ceil(pagination.total / pagination.pageSize),
    },
  }
  if (message) response.message = message
  return NextResponse.json(response)
}

export function apiCreated<T>(data: T, message?: string): NextResponse<SuccessResponse<T>> {
  return apiSuccess(data, message || 'با موفقیت ایجاد شد', 201)
}

// ---- Error Responses ----

export function apiError(error: string, status = 500, details?: Record<string, string[]>): NextResponse<ErrorResponse> {
  const response: ErrorResponse = {
    success: false,
    error,
    statusCode: status,
  }
  if (details) response.details = details
  return NextResponse.json(response, { status })
}

export function apiBadRequest(error = 'درخواست نامعتبر', details?: Record<string, string[]>): NextResponse<ErrorResponse> {
  return apiError(error, 400, details)
}

export function apiUnauthorized(error = 'دسترسی غیرمجاز'): NextResponse<ErrorResponse> {
  return apiError(error, 401)
}

export function apiForbidden(error = 'شما اجازه دسترسی به این بخش را ندارید'): NextResponse<ErrorResponse> {
  return apiError(error, 403)
}

export function apiNotFound(error = 'موردی یافت نشد'): NextResponse<ErrorResponse> {
  return apiError(error, 404)
}

export function apiConflict(error = 'تضاد در اطلاعات'): NextResponse<ErrorResponse> {
  return apiError(error, 409)
}

export function apiValidationError(details: Record<string, string[]>): NextResponse<ErrorResponse> {
  return apiError('خطا در اعتبارسنجی اطلاعات', 422, details)
}

// ---- Validation Helpers ----

interface ValidationRule {
  field: string
  value: unknown
  rules: {
    required?: boolean
    minLength?: number
    maxLength?: number
    min?: number
    max?: number
    pattern?: RegExp
    patternMessage?: string
    type?: 'string' | 'number' | 'email'
  }
}

export function validateFields(rules: ValidationRule[]): Record<string, string[]> | null {
  const errors: Record<string, string[]> = {}

  for (const rule of rules) {
    const fieldErrors: string[] = []
    const { field, value, rules: constraints } = rule

    // Required check
    if (constraints.required) {
      if (value === null || value === undefined || value === '' || (typeof value === 'string' && value.trim() === '')) {
        fieldErrors.push('این فیلد الزامی است')
      }
    }

    // Skip further validation if value is empty and not required
    if (value === null || value === undefined || value === '') continue

    const strValue = String(value)

    // Type checks
    if (constraints.type === 'number' && isNaN(Number(value))) {
      fieldErrors.push('مقدار باید عدد باشد')
    }

    if (constraints.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(strValue)) {
      fieldErrors.push('ایمیل نامعتبر است')
    }

    // String length checks
    if (constraints.minLength && strValue.length < constraints.minLength) {
      fieldErrors.push(`حداقل ${constraints.minLength} کاراکتر`)
    }

    if (constraints.maxLength && strValue.length > constraints.maxLength) {
      fieldErrors.push(`حداکثر ${constraints.maxLength} کاراکتر`)
    }

    // Number range checks
    if (constraints.min !== undefined && Number(value) < constraints.min) {
      fieldErrors.push(`مقدار نباید کمتر از ${constraints.min} باشد`)
    }

    if (constraints.max !== undefined && Number(value) > constraints.max) {
      fieldErrors.push(`مقدار نباید بیشتر از ${constraints.max} باشد`)
    }

    // Pattern check
    if (constraints.pattern && !constraints.pattern.test(strValue)) {
      fieldErrors.push(constraints.patternMessage || 'فرمت نامعتبر')
    }

    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors
    }
  }

  return Object.keys(errors).length > 0 ? errors : null
}
