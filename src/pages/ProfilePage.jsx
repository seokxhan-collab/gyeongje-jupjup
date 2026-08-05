import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, User } from 'lucide-react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../lib/AuthContext.jsx'
import { useDocumentMeta } from '../lib/useDocumentMeta.js'
import AccountSubnav from '../components/AccountSubnav.jsx'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, profile, loading: authLoading, signOut, setProfileOptimistic } = useAuth()
  const [nickname, setNickname] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState(false)

  useDocumentMeta({ title: '프로필 설정', noindex: true })

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { replace: true })
    }
  }, [authLoading, user, navigate])

  useEffect(() => {
    if (profile) setNickname(profile.nickname)
  }, [profile])

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSaved(false)

    const trimmed = nickname.trim()
    if (trimmed.length < 1 || trimmed.length > 20) {
      setError('닉네임은 1~20자로 입력해주세요.')
      return
    }

    setSaving(true)
    const { error: updateError } = await supabase.from('profiles').update({ nickname: trimmed }).eq('id', user.id)
    setSaving(false)

    if (updateError) {
      setError('닉네임 저장에 실패했습니다.')
      return
    }
    setProfileOptimistic({ nickname: trimmed })
    setSaved(true)
  }

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  if (authLoading || !user) {
    return (
      <div className="site-container site-page">
        <p className="page-empty">불러오는 중입니다...</p>
      </div>
    )
  }

  return (
    <div className="site-container site-page">
      <div className="page-header">
        <div className="page-header-title">
          <User size={18} />
          <h2 className="page-title">프로필 설정</h2>
        </div>
      </div>

      <AccountSubnav active="settings" />

      <div className="subscribe-panel">
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span>아이디</span>
            <input type="text" value={profile?.username ?? ''} className="subscribe-email-input" disabled />
          </label>
          <label className="auth-field">
            <span>닉네임</span>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="subscribe-email-input"
              maxLength={20}
              required
            />
          </label>

          {error && <p className="status-text status-error">{error}</p>}
          {saved && (
            <div className="subscribe-success">
              <Check size={18} />
              <span>닉네임이 저장되었습니다.</span>
            </div>
          )}

          <button type="submit" className="subscribe-cta-btn" disabled={saving}>
            {saving ? '저장하는 중...' : '닉네임 저장'}
          </button>
        </form>
      </div>

      <button type="button" className="auth-signout-btn" onClick={handleSignOut}>
        로그아웃
      </button>
    </div>
  )
}
