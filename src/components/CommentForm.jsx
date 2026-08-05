import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../lib/AuthContext.jsx'

export default function CommentForm({ newsId, onPosted }) {
  const { user, profile } = useAuth()
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  if (!user) {
    return (
      <p className="comment-login-hint">
        <Link to="/login">로그인</Link> 후 댓글을 남길 수 있어요.
      </p>
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const trimmed = body.trim()
    if (!trimmed) return

    setError(null)
    setLoading(true)
    const { data, error: insertError } = await supabase
      .from('news_comments')
      .insert({ news_id: newsId, user_id: user.id, body: trimmed })
      .select('id, body, created_at, user_id')
      .single()
    setLoading(false)

    if (insertError) {
      setError('댓글 등록에 실패했습니다.')
      return
    }

    setBody('')
    onPosted({ ...data, profiles: { nickname: profile?.nickname ?? '' } })
  }

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <textarea
        className="comment-textarea"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="댓글을 남겨보세요"
        maxLength={1000}
        rows={3}
        required
      />
      {error && <p className="status-text status-error">{error}</p>}
      <button type="submit" className="comment-submit-btn" disabled={loading || !body.trim()}>
        {loading ? '등록하는 중...' : '댓글 등록'}
      </button>
    </form>
  )
}
