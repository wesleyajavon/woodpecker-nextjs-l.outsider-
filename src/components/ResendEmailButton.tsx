'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Mail, CheckCircle, AlertCircle } from 'lucide-react'
import { useTranslation } from '@/contexts/LanguageContext'

interface ResendEmailButtonProps {
  orderId: string
  customerEmail: string
  isMultiItem?: boolean
  className?: string
}

export default function ResendEmailButton({ 
  orderId, 
  customerEmail, 
  isMultiItem = false,
  className = '' 
}: ResendEmailButtonProps) {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleResendEmail = async () => {
    setIsLoading(true)
    setStatus('idle')
    setMessage('')

    try {
      const response = await fetch(`/api/orders/resend-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          customerEmail,
          isMultiItem
        })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setStatus('success')
        setMessage(t('resendEmail.success'))
      } else {
        setStatus('error')
        setMessage(result.error || t('resendEmail.sendError'))
      }
    } catch (_error) {
      setStatus('error')
      setMessage(t('resendEmail.connectionError'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <Button
        onClick={handleResendEmail}
        disabled={isLoading}
        variant="card"
        className="w-full"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
            {t('resendEmail.sending')}
          </>
        ) : (
          <>
            <Mail className="w-4 h-4 mr-2" />
            {t('resendEmail.resendEmail')}
          </>
        )}
      </Button>

      {status === 'success' && (
        <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
          <CheckCircle className="w-4 h-4 text-green-400" />
          <span className="text-green-400 text-sm">{message}</span>
        </div>
      )}

      {status === 'error' && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span className="text-red-400 text-sm">{message}</span>
        </div>
      )}
    </div>
  )
}
