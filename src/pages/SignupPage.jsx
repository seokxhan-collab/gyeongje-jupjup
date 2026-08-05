import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../lib/AuthContext.jsx'
import { useDocumentMeta } from '../lib/useDocumentMeta.js'
import { isValidUsername, usernameToInternalEmail } from '../lib/username.js'

function mapAuthError(message) {
  if (!message) return '가입 중 오류가 발생했습니다.'
  if (message.includes('already registered') || message.includes('already exists')) {
    return '이미 사용 중인 아이디입니다.'
  }
  if (message.toLowerCase().includes('password')) {
    return '비밀번호는 6자 이상이어야 합니다.'
  }
  return message
}

export default function SignupPage() {
  const navigate = useNavigate()
  const { setProfileOptimistic } = useAuth()
  const [username, setUsername] = useState('')
  const [nickname, setNickname] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useDocumentMeta({
    title: '회원가입',
    description: '경제줍줍에 가입하고 댓글, 반응, 퀴즈 참여 시 닉네임을 남겨보세요.',
    noindex: true,
  })

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    const trimmedNickname = nickname.trim()

    if (!isValidUsername(username)) {
      setError('아이디는 영문/숫자/밑줄(_) 3~20자로 입력해주세요.')
      return
    }
    if (trimmedNickname.length < 1 || trimmedNickname.length > 20) {
      setError('닉네임은 1~20자로 입력해주세요.')
      return
    }
    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.')
      return
    }
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    setLoading(true)
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: usernameToInternalEmail(username),
      password,
      options: { data: { username, nickname: trimmedNickname } },
    })
    setLoading(false)

    if (signUpError) {
      setError(mapAuthError(signUpError.message))
      return
    }
    if (!data.session) {
      setError('가입 처리 중 문제가 발생했습니다. 다시 시도해주세요.')
      return
    }

    setProfileOptimistic({ id: data.user.id, username, nickname: trimmedNickname })
    navigate('/')
  }

  return (
    <div className="site-container site-page">
      <div className="page-header">
        <div className="page-header-title">
          <UserPlus size={18} />
          <h2 className="page-title">회원가입</h2>
        </div>
        <span className="page-date">
          가입하면 뉴스에 댓글과 반응을 남기고, 퀴즈 순위표에 닉네임으로 참여할 수 있어요.
        </span>
      </div>

      <div className="subscribe-panel">
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span>아이디</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="영문/숫자/밑줄(_) 3~20자"
              className="subscribe-email-input"
              maxLength={20}
              required
            />
          </label>
          <label className="auth-field">
            <span>닉네임</span>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="댓글/퀴즈에 표시될 닉네임"
              className="subscribe-email-input"
              maxLength={20}
              required
            />
          </label>
          <label className="auth-field">
            <span>비밀번호</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6자 이상"
              className="subscribe-email-input"
              required
            />
          </label>
          <label className="auth-field">
            <span>비밀번호 확인</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="subscribe-email-input"
              required
            />
          </label>

          {error && <p className="status-text status-error">{error}</p>}

          <button type="submit" className="subscribe-cta-btn" disabled={loading}>
            {loading ? '가입하는 중...' : '회원가입'}
          </button>
        </form>

        <p className="auth-switch">
          이미 계정이 있으신가요? <Link to="/login">로그인</Link>
        </p>
      </div>
    </div>
  )
}
