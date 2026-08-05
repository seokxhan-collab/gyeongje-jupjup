import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, MessageCircle, Sparkles, User } from 'lucide-react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../lib/AuthContext.jsx'
import { useDocumentMeta } from '../lib/useDocumentMeta.js'
import { formatRelativeTime } from '../lib/time.js'
import AccountSubnav from '../components/AccountSubnav.jsx'

export default function MyPage() {
  const navigate = useNavigate()
  const { user, profile, loading: authLoading } = useAuth()
  const [comments, setComments] = useState([])
  const [likedNews, setLikedNews] = useState([])
  const [quizHistory, setQuizHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useDocumentMeta({ title: '내 활동', noindex: true })

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { replace: true })
    }
  }, [authLoading, user, navigate])

  useEffect(() => {
    if (!user) return
    let cancelled = false
    setLoading(true)

    Promise.all([
      supabase
        .from('news_comments')
        .select('id, body, created_at, news(id, title)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50),
      supabase
        .from('news_reactions')
        .select('news_id, created_at, news(id, title)')
        .eq('user_id', user.id)
        .eq('reaction', 'like')
        .order('created_at', { ascending: false })
        .limit(50),
      supabase
        .from('quiz_scores')
        .select('quiz_date, score, total')
        .eq('user_id', user.id)
        .order('quiz_date', { ascending: false })
        .limit(30),
    ]).then(([commentsRes, reactionsRes, quizRes]) => {
      if (cancelled) return
      setComments(commentsRes.data ?? [])
      setLikedNews(reactionsRes.data ?? [])
      setQuizHistory(quizRes.data ?? [])
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [user])

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
          <h2 className="page-title">내 활동</h2>
        </div>
        {profile && <span className="page-date">{profile.nickname}님의 활동 기록</span>}
      </div>

      <AccountSubnav active="activity" />

      <section className="mypage-section">
        <h3 className="mypage-section-title">
          <MessageCircle size={16} /> 내가 쓴 댓글 ({comments.length})
        </h3>
        {loading && <p className="status-text">불러오는 중...</p>}
        {!loading && comments.length === 0 && <p className="status-text">아직 작성한 댓글이 없습니다.</p>}
        <ul className="mypage-list">
          {comments.map((c) => (
            <li key={c.id} className="mypage-item">
              <Link to={c.news ? `/news/${c.news.id}` : '#'} className="mypage-item-link">
                {c.news?.title ?? '삭제된 뉴스'}
              </Link>
              <p className="mypage-item-body">{c.body}</p>
              <span className="mypage-item-time">{formatRelativeTime(c.created_at)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mypage-section">
        <h3 className="mypage-section-title">
          <Heart size={16} /> 좋아요한 뉴스 ({likedNews.length})
        </h3>
        {!loading && likedNews.length === 0 && <p className="status-text">아직 좋아요한 뉴스가 없습니다.</p>}
        <ul className="mypage-list">
          {likedNews.map((r) => (
            <li key={r.news_id} className="mypage-item">
              <Link to={r.news ? `/news/${r.news.id}` : '#'} className="mypage-item-link">
                {r.news?.title ?? '삭제된 뉴스'}
              </Link>
              <span className="mypage-item-time">{formatRelativeTime(r.created_at)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mypage-section">
        <h3 className="mypage-section-title">
          <Sparkles size={16} /> 퀴즈 기록 ({quizHistory.length})
        </h3>
        {!loading && quizHistory.length === 0 && <p className="status-text">아직 퀴즈에 참여하지 않았습니다.</p>}
        <ul className="mypage-list">
          {quizHistory.map((q) => (
            <li key={q.quiz_date} className="mypage-item">
              <Link to={`/quiz/${q.quiz_date}`} className="mypage-item-link">
                {q.quiz_date} 퀴즈
              </Link>
              <span className="mypage-item-score">
                {q.score} / {q.total}점
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
