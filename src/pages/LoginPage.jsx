import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { supabase } from '../lib/supabaseClient.js'
import { useDocumentMeta } from '../lib/useDocumentMeta.js'
import { usernameToInternalEmail } from '../lib/username.js'

function mapAuthError(message) {
  if (!message) return '로그인 중 오류가 발생했습니다.'
  if (message.includes('Invalid login credentials')) {
    return '아이디 또는 비밀번호가 올바르지 않습니다.'
  }
  return message
}

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useDocumentMeta({ title: '로그인', description: '경제줍줍 로그인', noindex: true })

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: usernameToInternalEmail(username.trim()),
      password,
    })
    setLoading(false)

    if (signInError) {
      setError(mapAuthError(signInError.message))
      return
    }
    navigate(location.state?.from ?? '/')
  }

  return (
    <div className="site-container site-page">
      <div className="page-header">
        <div className="page-header-title">
          <LogIn size={18} />
          <h2 className="page-title">로그인</h2>
        </div>
      </div>

      <div className="subscribe-panel">
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span>아이디</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="subscribe-email-input"
              required
            />
          </label>
          <label className="auth-field">
            <span>비밀번호</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="subscribe-email-input"
              required
            />
          </label>

          {error && <p className="status-text status-error">{error}</p>}

          <button type="submit" className="subscribe-cta-btn" disabled={loading}>
            {loading ? '로그인하는 중...' : '로그인'}
          </button>
        </form>

        <p className="auth-switch">
          계정이 없으신가요? <Link to="/signup">회원가입</Link>
        </p>
      </div>
    </div>
  )
}
