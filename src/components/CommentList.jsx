import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../lib/AuthContext.jsx'
import { formatRelativeTime } from '../lib/time.js'
import CommentForm from './CommentForm.jsx'

export default function CommentList({ newsId }) {
  const { user } = useAuth()
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    supabase
      .from('news_comments')
      .select('id, body, created_at, user_id, profiles(nickname)')
      .eq('news_id', newsId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (cancelled) return
        setComments(data ?? [])
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [newsId])

  function handlePosted(comment) {
    setComments((prev) => [...prev, comment])
  }

  async function handleDelete(id) {
    await supabase.from('news_comments').delete().eq('id', id)
    setComments((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <div className="comment-section">
      <h3 className="comment-section-title">댓글 {comments.length}</h3>

      <CommentForm newsId={newsId} onPosted={handlePosted} />

      {loading && <p className="status-text">불러오는 중...</p>}
      {!loading && comments.length === 0 && (
        <p className="status-text">아직 댓글이 없습니다. 첫 댓글을 남겨보세요!</p>
      )}

      <ul className="comment-list">
        {comments.map((c) => (
          <li key={c.id} className="comment-item">
            <div className="comment-item-head">
              <span className="comment-item-nickname">{c.profiles?.nickname ?? '알 수 없음'}</span>
              <span className="comment-item-time">{formatRelativeTime(c.created_at)}</span>
              {user?.id === c.user_id && (
                <button
                  type="button"
                  className="comment-delete-btn"
                  onClick={() => handleDelete(c.id)}
                  aria-label="댓글 삭제"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
            <p className="comment-item-body">{c.body}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
