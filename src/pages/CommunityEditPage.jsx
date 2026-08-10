import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Pencil } from 'lucide-react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../lib/AuthContext.jsx'
import { useDocumentMeta } from '../lib/useDocumentMeta.js'
import { COMMUNITY_CATEGORIES } from '../lib/communityCategories.js'

export default function CommunityEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, profile, loading: authLoading } = useAuth()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState(COMMUNITY_CATEGORIES[0].value)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [pinned, setPinned] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useDocumentMeta({ title: '글 수정', noindex: true })

  useEffect(() => {
    let cancelled = false
    supabase
      .from('community_posts')
      .select('id, title, body, category, pinned, user_id')
      .eq('id', id)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return
        setPost(data)
        if (data) {
          setCategory(data.category)
          setTitle(data.title)
          setBody(data.body)
          setPinned(data.pinned)
        }
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  useEffect(() => {
    if (authLoading || loading || !post) return
    const canEdit = user?.id === post.user_id || profile?.is_admin
    if (!canEdit) navigate(`/community/${id}`, { replace: true })
  }, [authLoading, loading, post, user, profile, id, navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    const trimmedTitle = title.trim()
    const trimmedBody = body.trim()
    if (!trimmedTitle || !trimmedBody) return

    setError(null)
    setSaving(true)
    const { error: updateError } = await supabase
      .from('community_posts')
      .update({
        category,
        title: trimmedTitle,
        body: trimmedBody,
        ...(profile?.is_admin ? { pinned } : {}),
      })
      .eq('id', id)
    setSaving(false)

    if (updateError) {
      setError('글 수정에 실패했습니다.')
      return
    }

    navigate(`/community/${id}`)
  }

  if (loading) {
    return (
      <div className="site-container site-page">
        <p className="page-empty">불러오는 중입니다...</p>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="site-container site-page">
        <p className="page-empty">해당 글을 찾을 수 없습니다.</p>
        <Link to="/community" className="page-archive-link">
          커뮤니티로 돌아가기
        </Link>
      </div>
    )
  }

  return (
    <div className="site-container site-page">
      <div className="page-header">
        <div className="page-header-title">
          <Pencil size={18} />
          <h2 className="page-title">글 수정</h2>
        </div>
      </div>

      <div className="subscribe-panel">
        <form className="auth-form" onSubmit={handleSubmit}>
          {profile?.is_admin && (
            <label className="auth-field" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} />
              <span>공지글로 등록 (상단 고정, 삭제 불가)</span>
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

          <button type="submit" className="subscribe-cta-btn" disabled={saving || !title.trim() || !body.trim()}>
            {saving ? '저장하는 중...' : '저장하기'}
          </button>
        </form>
      </div>
    </div>
  )
}
