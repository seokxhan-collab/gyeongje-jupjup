import { useState } from 'react'
import { Send, Mail, Check } from 'lucide-react'
import { supabase } from '../lib/supabaseClient.js'
import { useDocumentMeta } from '../lib/useDocumentMeta.js'

const CHANNELS = [
  { id: 'telegram', label: '텔레그램', icon: Send, available: true },
  { id: 'email', label: '이메일', icon: Mail, available: true },
]

export default function SubscribePage() {
  const [channel, setChannel] = useState('telegram')
  const [loading, setLoading] = useState(false)
  const [deepLink, setDeepLink] = useState(null)
  const [error, setError] = useState(null)

  const [email, setEmail] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [emailError, setEmailError] = useState(null)

  useDocumentMeta({
    title: '오늘의 브리핑 구독 (무료)',
    description: '경제줍줍의 오늘의 경제 브리핑을 텔레그램·이메일로 매일 아침 무료로 받아보세요. 가입비, 이용료 없이 완전 무료입니다.',
  })

  async function startTelegramSubscribe() {
    setLoading(true)
    setError(null)
    const { data, error: fnError } = await supabase.functions.invoke('subscribe-telegram', { body: {} })
    setLoading(false)
    if (fnError || data?.error) {
      setError(fnError?.message ?? data?.error ?? '구독 시작 중 오류가 발생했습니다.')
      return
    }
    setDeepLink(data.deepLink)
    window.open(data.deepLink, '_blank', 'noopener,noreferrer')
  }

  async function submitEmailSubscribe(e) {
    e.preventDefault()
    setEmailLoading(true)
    setEmailError(null)
    const { data, error: fnError } = await supabase.functions.invoke('subscribe-email', { body: { email } })
    setEmailLoading(false)
    if (fnError || data?.error) {
      setEmailError(fnError?.message ?? data?.error ?? '구독 신청 중 오류가 발생했습니다.')
      return
    }
    setEmailSent(true)
  }

  return (
    <div className="site-container site-page">
      <div className="page-header">
        <div className="page-header-title">
          <Send size={18} />
          <h2 className="page-title">오늘의 브리핑 구독</h2>
          <span className="subscribe-free-badge">100% 무료</span>
        </div>
        <span className="page-date">매일 아침 AI가 만든 경제 브리핑을 원하는 채널로 무료로 받아보세요. 가입비·이용료 없이 언제든 해지 가능해요.</span>
      </div>

      <div className="subscribe-channels">
        {CHANNELS.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`subscribe-channel-btn ${channel === c.id ? 'active' : ''}`}
            onClick={() => setChannel(c.id)}
          >
            <c.icon size={18} />
            {c.label}
            {!c.available && <span className="subscribe-channel-badge">준비중</span>}
          </button>
        ))}
      </div>

      {channel === 'telegram' && (
        <div className="subscribe-panel">
          <h3 className="subscribe-panel-title">텔레그램으로 받는 방법</h3>
          <ol className="subscribe-steps">
            <li>스마트폰이나 PC에 텔레그램(Telegram) 앱이 설치되어 있어야 합니다. 없다면 앱스토어·플레이스토어에서 "Telegram"을 검색해 먼저 설치해주세요.</li>
            <li>아래 버튼을 누르면 경제줍줍 봇과의 대화창이 열립니다.</li>
            <li>대화창 아래 <strong>"시작(Start)"</strong> 버튼만 누르면 구독이 자동으로 완료됩니다.</li>
            <li>이후 매일 아침 이 봇이 오늘의 브리핑을 대화로 보내드립니다. 그만 받고 싶으면 봇과의 대화창에서 <code>/stop</code> 이라고 입력하면 됩니다.</li>
          </ol>

          {!deepLink ? (
            <button type="button" className="subscribe-cta-btn" onClick={startTelegramSubscribe} disabled={loading}>
              {loading ? '연결하는 중...' : '텔레그램으로 구독 시작하기'}
            </button>
          ) : (
            <div className="subscribe-success">
              <Check size={18} />
              <span>
                텔레그램이 열리지 않았다면{' '}
                <a href={deepLink} target="_blank" rel="noopener noreferrer">
                  이 링크를 눌러주세요
                </a>
                . 대화창에서 "시작" 버튼까지 눌러야 구독이 완료됩니다.
              </span>
            </div>
          )}
          {error && <p className="status-text status-error">{error}</p>}
        </div>
      )}

      {channel === 'email' && (
        <div className="subscribe-panel">
          <h3 className="subscribe-panel-title">이메일로 받는 방법</h3>
          <ol className="subscribe-steps">
            <li>아래 입력칸에 브리핑을 받고 싶은 이메일 주소를 입력하고 버튼을 눌러주세요.</li>
            <li>입력한 이메일로 인증 메일이 도착합니다. 메일 안의 <strong>"구독 완료하기"</strong> 버튼을 눌러야 구독이 완료됩니다.</li>
            <li>이후 매일 아침 이 주소로 오늘의 브리핑이 도착합니다. 메일 하단의 "구독 해지" 링크로 언제든 그만 받을 수 있어요.</li>
          </ol>

          {!emailSent ? (
            <form className="subscribe-email-form" onSubmit={submitEmailSubscribe}>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="subscribe-email-input"
              />
              <button type="submit" className="subscribe-cta-btn" disabled={emailLoading}>
                {emailLoading ? '전송하는 중...' : '인증 메일 받기'}
              </button>
            </form>
          ) : (
            <div className="subscribe-success">
              <Check size={18} />
              <span>인증 메일을 보냈어요. 메일함(스팸함도 확인!)에서 "구독 완료하기"를 눌러주세요.</span>
            </div>
          )}
          {emailError && <p className="status-text status-error">{emailError}</p>}
        </div>
      )}
    </div>
  )
}
