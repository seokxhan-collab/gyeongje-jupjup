import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MessagesSquare, PenLine } from 'lucide-react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../lib/AuthContext.jsx'
import { useDocumentMeta } from '../lib/useDocumentMeta.js'
import { formatRelativeTime } from '../lib/time.js'
import { COMMUNITY_CATEGORIES, communityCategoryLabel } from '../lib/communityCategories.js'

export default function CommunityPage() {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('all')

  useDocumentMeta({
    title: '커뮤니티',
    description: '경제줍줍 회원들이 자유롭게 이야기 나누는 커뮤니티 게시판입니다.',
  })

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    let query = supabase
      .from('community_posts')
      .select('id, title, category, created_at, profiles(nickname), community_post_comments(count)')
      .eq('hidden', false)
      .order('created_at', { ascending: false })

    if (category !== 'all') {
      query = query.eq('category', category)
    }

    query.then(({ data }) => {
      if (cancelled) return
      setPosts(data ?? [])
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [category])

  return (
    <div className="site-container site-page">
      <div className="page-header">
        <div className="page-header-title">
          <MessagesSquare size={18} />
          <h2 className="page-title">커뮤니티</h2>
        </div>
        <span className="page-date">자유롭게 이야기를 나눠보세요</span>
      </div>

      <div className="community-toolbar">
        <div className="filter-list">
          {[{ value: 'all', label: '전체' }, ...COMMUNITY_CATEGORIES].map((c) => (
            <button
              key={c.value}
              className={`chip ${category === c.value ? 'active' : ''}`}
              onClick={() => setCategory(c.value)}
            >
              {c.label}
            </button>
          ))}
        </div>

        {user ? (
          <Link to="/community/new" className="community-write-btn">
            <PenLine size={14} /> 글쓰기
          </Link>
        ) : (
          <Link to="/login" className="community-write-btn">
            <PenLine size={14} /> 글쓰기
          </Link>
        )}
      </div>

      {loading && <p className="page-empty">불러오는 중입니다...</p>}
      {!loading && posts.length === 0 && <p className="page-empty">아직 등록된 글이 없습니다. 첫 글을 남겨보세요!</p>}

      <ul className="archive-list">
        {posts.map((p) => (
          <li key={p.id}>
            <Link to={`/community/${p.id}`} className="archive-list-item community-list-item">
              <span className="glossary-category-tag community-list-category">{communityCategoryLabel(p.category)}</span>
              <span className="community-list-title">{p.title}</span>
              <span className="archive-list-meta">
                {p.profiles?.nickname ?? '알 수 없음'} · {formatRelativeTime(p.created_at)} · 댓글 {p.community_post_comments?.[0]?.count ?? 0}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
