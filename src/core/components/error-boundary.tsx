'use client'

import { Component, ErrorInfo, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/core/components/ui/button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  module?: string 
}

interface State {
  hasError: boolean
  error?: Error
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: undefined }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`ErrorBoundary [${this.props.module || 'نامشخص'}]:`, error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-[400px] flex items-center justify-center p-6" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="text-center max-w-md"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/30 flex items-center justify-center shadow-lg"
              >
                <AlertTriangle className="w-10 h-10 text-red-500" />
              </motion.div>

              <h3 className="text-xl font-bold text-foreground mb-2">
                خطایی رخ داده است
              </h3>

              <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
                   {this.props.module
                    ? `متأسفانه در بخش «${this.props.module}» مشکلی پیش آمد.`
                     : 'متأسفانه در پردازش این بخش مشکلی پیش آمد.'}
                  <br />
                   لطفاً دوباره تلاش کنید.
              </p>

              <div className="flex items-center justify-center gap-3">
                <Button onClick={this.handleReset} variant="default" className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  تلاش مجدد
                </Button>
                
                <Button 
                  onClick={() => window.location.href = '/dashboard'} 
                  variant="outline" 
                  className="gap-2"
                >
                  <Home className="w-4 h-4" />
                  صفحه اصلی
                </Button>
              </div>
            </motion.div>
          </div>
        )
      )
    }

    return this.props.children
  }
}