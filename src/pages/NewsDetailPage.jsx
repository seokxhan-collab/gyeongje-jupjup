import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ExternalLink, MessageCircle } from 'lucide-react'
import { supabase } from '../lib/supabaseClient.js'
import { useDocumentMeta } from '../lib/useDocumentMeta.js'
import { categoryLabel } from '../lib/categories.js'
import { formatRelativeTime } from '../lib/time.js'
import NewsReactions from '../components/NewsReactions.jsx'
import CommentList from '../components/CommentList.jsx'

export default function NewsDetailPage() {
  const { id } = useParams()
  const [news, setNews] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    supabase
      .from('news')
      .select('id, source, source_country, category, title, summary, link, published_at')
      .eq('id', id)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return
        setNews(data)
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  useDocumentMeta({
    title: news?.title ?? '뉴스',
    description: news?.summary ?? '경제줍줍에서 모은 국내외 경제뉴스.',
  })

  if (loading) {
    return (
      <div className="site-container site-page">
        <p className="page-empty">불러오는 중입니다...</p>
      </div>
    )
  }

  if (!news) {
    return (
      <div className="site-container site-page">
        <p className="page-empty">해당 뉴스를 찾을 수 없습니다.</p>
        <Link to="/" className="page-archive-link">
          홈으로 돌아가기
        </Link>
      </div>
    )
  }

  return (
    <div className="site-container site-page">
      <div className="page-header">
        <div className="page-header-title">
          <MessageCircle size={18} />
          <h2 className="page-title">뉴스</h2>
        </div>
      </div>

      <article className="news-detail-card">
        <div className="news-card-meta">
          <div className="news-card-tags">
            <span className={`badge badge-${news.source_country}`}>{news.source}</span>
            <span className={`badge badge-category badge-category-${news.category}`}>
              {categoryLabel(news.category)}
            </span>
          </div>
          <span className="news-card-time">{formatRelativeTime(news.published_at)}</span>
        </div>
        <h1 className="news-detail-title">{news.title}</h1>
        {news.summary && <p className="news-detail-summary">{news.summary}</p>}
        <a className="news-card-link" href={news.link} target="_blank" rel="noopener noreferrer">
          원문 보기 <ExternalLink size={14} />
        </a>

        <NewsReactions newsId={news.id} />
      </article>

      <CommentList newsId={news.id} />
    </div>
  )
}
