import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Flag, MessagesSquare, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../lib/AuthContext.jsx'
import { useDocumentMeta } from '../lib/useDocumentMeta.js'
import { formatRelativeTime } from '../lib/time.js'
import { communityCategoryLabel } from '../lib/communityCategories.js'
import CommunityCommentList from '../components/CommunityCommentList.jsx'

export default function CommunityPostPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [reported, setReported] = useState(false)
  const [reportMessage, setReportMessage] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    supabase
      .from('community_posts')
      .select('id, title, body, category, created_at, user_id, profiles(nickname)')
      .eq('id', id)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return
        setPost(data)
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  useDocumentMeta({
    title: post?.title ?? '커뮤니티',
    description: post?.body?.slice(0, 80) ?? '경제줍줍 커뮤니티 게시판.',
  })

  async function handleDelete() {
    await supabase.from('community_posts').delete().eq('id', id)
    navigate('/community', { replace: true })
  }

  async function handleReport() {
    if (!user || reported) return
    const { error } = await supabase.from('community_post_reports').insert({ post_id: id, reporter_id: user.id })
    setReported(true)

    if (error?.code === '23505') {
      setReportMessage('이미 신고한 글입니다.')
    } else if (error) {
      setReportMessage('신고 처리 중 오류가 발생했습니다.')
    } else {
      setReportMessage('신고가 접수되었습니다.')
    }
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
          <MessagesSquare size={18} />
          <h2 className="page-title">커뮤니티</h2>
        </div>
      </div>

      <Link to="/community" className="page-archive-link">
        목록으로
      </Link>

      <article className="news-detail-card">
        <div className="news-card-meta">
          <div className="news-card-tags">
            <span className="glossary-category-tag">{communityCategoryLabel(post.category)}</span>
          </div>
          <span className="news-card-time">
            {post.profiles?.nickname ?? '알 수 없음'} · {formatRelativeTime(post.created_at)}
          </span>
        </div>
        <h1 className="news-detail-title">{post.title}</h1>
        <p className="news-detail-summary">{post.body}</p>

        <div className="comment-item-head community-post-actions">
          {user?.id === post.user_id ? (
            <button type="button" className="comment-delete-btn" onClick={handleDelete} aria-label="글 삭제">
              <Trash2 size={14} /> 삭제
            </button>
          ) : (
            user && (
              <button
                type="button"
                className="comment-report-btn"
                onClick={handleReport}
                disabled={reported}
                aria-label="글 신고"
              >
                <Flag size={14} /> 신고
              </button>
            )
          )}
        </div>
        {reportMessage && <p className="comment-report-message">{reportMessage}</p>}
      </article>

      <CommunityCommentList postId={post.id} />
    </div>
  )
}
