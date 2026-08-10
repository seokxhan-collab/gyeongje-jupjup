import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MessagesSquare, Pin, PenLine } from 'lucide-react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../lib/AuthContext.jsx'
import { useDocumentMeta } from '../lib/useDocumentMeta.js'
import { formatRelativeTime } from '../lib/time.js'
import { COMMUNITY_CATEGORIES, communityCategoryLabel } from '../lib/communityCategories.js'
import AdSlot from '../components/AdSlot.jsx'

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
    const columns = 'id, title, category, pinned, created_at, profiles(nickname), community_post_comments(count)'

    // 고정 공지는 카테고리 필터와 무관하게 항상 최상단에 노출한다.
    const pinnedQuery = supabase
      .from('community_posts')
      .select(columns)
      .eq('hidden', false)
      .eq('pinned', true)
      .order('created_at', { ascending: false })

    let restQuery = supabase
      .from('community_posts')
      .select(columns)
      .eq('hidden', false)
      .eq('pinned', false)
      .order('created_at', { ascending: false })

    if (category !== 'all') {
      restQuery = restQuery.eq('category', category)
    }

    Promise.all([pinnedQuery, restQuery]).then(([{ data: pinned }, { data: rest }]) => {
      if (cancelled) return
      setPosts([...(pinned ?? []), ...(rest ?? [])])
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [category])

  return (
    <div className="site-container site-page">
      <AdSlot placement="top-banner" />

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
            <Link
              to={`/community/${p.id}`}
              className={`archive-list-item community-list-item ${p.pinned ? 'community-list-item-pinned' : ''}`}
            >
              <span className="glossary-category-tag community-list-category">
                {p.pinned ? <Pin size={11} /> : null}
                {p.pinned ? '공지' : communityCategoryLabel(p.category)}
              </span>
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
