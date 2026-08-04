import { useState } from 'react'
import { Send, Mail, MessageCircle, Check } from 'lucide-react'
import { supabase } from '../lib/supabaseClient.js'
import { useDocumentMeta } from '../lib/useDocumentMeta.js'

const CHANNELS = [
  { id: 'telegram', label: '텔레그램', icon: Send, available: true },
  { id: 'email', label: '이메일', icon: Mail, available: false },
  { id: 'kakao', label: '카카오톡 알림톡', icon: MessageCircle, available: false },
]

export default function SubscribePage() {
  const [channel, setChannel] = useState('telegram')
  const [loading, setLoading] = useState(false)
  const [deepLink, setDeepLink] = useState(null)
  const [error, setError] = useState(null)

  useDocumentMeta({
    title: '오늘의 브리핑 구독',
    description: '경제줍줍의 오늘의 경제 브리핑을 텔레그램으로 매일 아침 받아보세요.',
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

  return (
    <div className="site-container site-page">
      <div className="page-header">
        <div className="page-header-title">
          <Send size={18} />
          <h2 className="page-title">오늘의 브리핑 구독</h2>
        </div>
        <span className="page-date">매일 아침 AI가 만든 경제 브리핑을 원하는 채널로 받아보세요</span>
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
          <h3 className="subscribe-panel-title">이메일 구독은 준비 중입니다</h3>
          <p className="subscribe-panel-desc">
            이메일 발송은 스팸 방지를 위해 도메인 인증 절차가 필요해 아직 준비 중입니다. 곧 지원할
            예정이니 조금만 기다려주세요! 지금은 텔레그램으로 먼저 받아보실 수 있어요.
          </p>
        </div>
      )}

      {channel === 'kakao' && (
        <div className="subscribe-panel">
          <h3 className="subscribe-panel-title">카카오톡 알림톡은 준비 중입니다</h3>
          <p className="subscribe-panel-desc">
            카카오톡 알림톡은 사업자 등록과 별도의 심사 절차가 필요한 서비스라 아직 준비 중입니다. 지금은
            텔레그램으로 먼저 받아보실 수 있어요.
          </p>
        </div>
      )}
    </div>
  )
}
