import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 دقیقه - دیتا قدیمی میشه
      gcTime: 10 * 60 * 1000,        // 10 دقیقه - توی کش میمونه
      refetchOnWindowFocus: false,   // با رفتن به تب دیگه رفرش نکن
      refetchOnMount: false,         // با مانت شدن مجدد رفرش نکن
      refetchOnReconnect: false,     // با reconnect رفرش نکن
      retry: 1,                      // تعداد تلاش مجدد
      retryDelay: 1000,              // فاصله بین تلاش‌ها
    },
    mutations: {
      retry: 1,
    },
  },
})