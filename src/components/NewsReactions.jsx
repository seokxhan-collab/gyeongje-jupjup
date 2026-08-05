import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ThumbsDown, ThumbsUp } from 'lucide-react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../lib/AuthContext.jsx'

export default function NewsReactions({ newsId }) {
  const { user } = useAuth()
  const [counts, setCounts] = useState({ like: 0, dislike: 0 })
  const [myReaction, setMyReaction] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    supabase
      .from('news_reactions')
      .select('reaction, user_id')
      .eq('news_id', newsId)
      .then(({ data }) => {
        if (cancelled) return
        const rows = data ?? []
        setCounts({
          like: rows.filter((r) => r.reaction === 'like').length,
          dislike: rows.filter((r) => r.reaction === 'dislike').length,
        })
        setMyReaction(rows.find((r) => r.user_id === user?.id)?.reaction ?? null)
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [newsId, user?.id])

  async function react(reaction) {
    if (!user) return

    if (myReaction === reaction) {
      await supabase.from('news_reactions').delete().eq('news_id', newsId).eq('user_id', user.id)
      setMyReaction(null)
      setCounts((c) => ({ ...c, [reaction]: Math.max(0, c[reaction] - 1) }))
      return
    }

    const prev = myReaction
    await supabase
      .from('news_reactions')
      .upsert({ news_id: newsId, user_id: user.id, reaction }, { onConflict: 'news_id,user_id' })
    setMyReaction(reaction)
    setCounts((c) => {
      const next = { ...c, [reaction]: c[reaction] + 1 }
      if (prev) next[prev] = Math.max(0, next[prev] - 1)
      return next
    })
  }

  return (
    <div className="news-reactions">
      <button
        type="button"
        className={`news-reaction-btn ${myReaction === 'like' ? 'active' : ''}`}
        onClick={() => react('like')}
        disabled={!user || loading}
      >
        <ThumbsUp size={16} />
        {counts.like}
      </button>
      <button
        type="button"
        className={`news-reaction-btn dislike ${myReaction === 'dislike' ? 'active' : ''}`}
        onClick={() => react('dislike')}
        disabled={!user || loading}
      >
        <ThumbsDown size={16} />
        {counts.dislike}
      </button>
      {!user && (
        <span className="news-reaction-login-hint">
          <Link to="/login">로그인</Link> 후 반응을 남길 수 있어요.
        </span>
      )}
    </div>
  )
}
