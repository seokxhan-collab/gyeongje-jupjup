import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Check, X, Mail } from 'lucide-react'
import { supabase } from '../lib/supabaseClient.js'
import { useDocumentMeta } from '../lib/useDocumentMeta.js'

export default function ConfirmSubscriptionPage() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('loading') // loading | ok | error
  const [message, setMessage] = useState('')

  useDocumentMeta({ title: '이메일 구독 확인', noindex: true })

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setStatus('error')
      setMessage('유효하지 않은 링크입니다.')
      return
    }
    supabase.functions.invoke('confirm-email-subscription', { body: { token } }).then(({ data, error }) => {
      if (error || data?.error) {
        setStatus('error')
        setMessage(data?.error ?? '구독 확인에 실패했습니다.')
        return
      }
      setStatus('ok')
    })
  }, [searchParams])

  return (
    <div className="site-container site-page">
      <div className="page-header">
        <div className="page-header-title">
          <Mail size={18} />
          <h2 className="page-title">이메일 구독 확인</h2>
        </div>
      </div>

      <div className="subscribe-panel">
        {status === 'loading' && <p className="status-text">확인하는 중...</p>}
        {status === 'ok' && (
          <div className="subscribe-success">
            <Check size={18} />
            <span>이메일 구독이 완료됐습니다! 내일 아침부터 오늘의 브리핑을 보내드릴게요.</span>
          </div>
        )}
        {status === 'error' && (
          <p className="status-text status-error">
            <X size={16} /> {message}
          </p>
        )}
        <p style={{ marginTop: 16 }}>
          <Link to="/subscribe">구독 페이지로 돌아가기</Link>
        </p>
      </div>
    </div>
  )
}
