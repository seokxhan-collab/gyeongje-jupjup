import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PenLine } from 'lucide-react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../lib/AuthContext.jsx'
import { useDocumentMeta } from '../lib/useDocumentMeta.js'
import { COMMUNITY_CATEGORIES } from '../lib/communityCategories.js'

export default function CommunityWritePage() {
  const navigate = useNavigate()
  const { user, profile, loading: authLoading } = useAuth()
  const [category, setCategory] = useState(COMMUNITY_CATEGORIES[0].value)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [pinned, setPinned] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useDocumentMeta({ title: '글쓰기', noindex: true })

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { replace: true })
    }
  }, [authLoading, user, navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    const trimmedTitle = title.trim()
    const trimmedBody = body.trim()
    if (!trimmedTitle || !trimmedBody) return

    setError(null)
    setLoading(true)
    const { data, error: insertError } = await supabase
      .from('community_posts')
      .insert({
        user_id: user.id,
        category,
        title: trimmedTitle,
        body: trimmedBody,
        ...(profile?.is_admin ? { pinned } : {}),
      })
      .select('id')
      .single()
    setLoading(false)

    if (insertError) {
      setError('글 등록에 실패했습니다.')
      return
    }

    navigate(`/community/${data.id}`)
  }

  if (!user) return null

  return (
    <div className="site-container site-page">
      <div className="page-header">
        <div className="page-header-title">
          <PenLine size={18} />
          <h2 className="page-title">글쓰기</h2>
        </div>
      </div>

      <div className="subscribe-panel">
        <form className="auth-form" onSubmit={handleSubmit}>
          {profile?.is_admin && (
            <label className="admin-pin-toggle">
              <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} />
              <span>공지글로 등록 (상단 고정, 일반 회원은 삭제 불가)</span>
            </label>
          )}
          <label className="auth-field">
            <span>카테고리</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="subscribe-email-input"
            >
              {COMMUNITY_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <label className="auth-field">
            <span>제목</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력하세요"
              className="subscribe-email-input"
              maxLength={100}
              required
            />
          </label>
          <label className="auth-field">
            <span>내용</span>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="내용을 입력하세요"
              className="comment-textarea"
              maxLength={5000}
              rows={10}
              required
            />
          </label>

          {error && <p className="status-text status-error">{error}</p>}

          <button type="submit" className="subscribe-cta-btn" disabled={loading || !title.trim() || !body.trim()}>
            {loading ? '등록하는 중...' : '등록하기'}
          </button>
        </form>
      </div>
    </div>
  )
}
