import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bookmark, ExternalLink, Languages, MessageCircle } from 'lucide-react'
import { formatRelativeTime } from '../lib/time.js'
import { categoryLabel } from '../lib/categories.js'
import { useBookmarks } from '../lib/useBookmarks.js'

export default function NewsCard({ item }) {
  const { isBookmarked, toggleBookmark } = useBookmarks()
  const saved = isBookmarked(item.id)
  const [showOriginal, setShowOriginal] = useState(false)

  const hasTranslation = Boolean(item.title_ko)
  const displayTitle = hasTranslation && !showOriginal ? item.title_ko : item.title
  const displaySummary = hasTranslation && !showOriginal ? item.summary_ko || item.summary : item.summary

  return (
    <article className="news-card">
      <div className="news-card-meta">
        <div className="news-card-tags">
          <span className={`badge badge-${item.source_country}`}>{item.source}</span>
          <span className={`badge badge-category badge-category-${item.category}`}>
            {categoryLabel(item.category)}
          </span>
          {hasTranslation && (
            <button
              type="button"
              className="badge badge-translate"
              onClick={() => setShowOriginal((v) => !v)}
            >
              <Languages size={12} />
              {showOriginal ? '한글 번역' : '영어 원문'}
            </button>
          )}
        </div>
        <span className="news-card-time">{formatRelativeTime(item.published_at)}</span>
      </div>
      <h3 className="news-card-title">
        <Link to={`/news/${item.id}`} className="news-card-title-link">
          {displayTitle}
        </Link>
      </h3>
      {displaySummary && <p className="news-card-summary">{displaySummary}</p>}
      <div className="news-card-footer">
        <div className="news-card-footer-links">
          <a className="news-card-link" href={item.link} target="_blank" rel="noopener noreferrer">
            원문 보기 <ExternalLink size={14} />
          </a>
          <Link to={`/news/${item.id}`} className="news-card-comment-link">
            <MessageCircle size={14} /> 댓글·반응
          </Link>
        </div>
        <button
          type="button"
          className={`news-card-save ${saved ? 'active' : ''}`}
          aria-label={saved ? '스크랩 해제' : '스크랩'}
          onClick={() => toggleBookmark(item)}
        >
          <Bookmark size={16} fill={saved ? 'currentColor' : 'none'} />
        </button>
      </div>
    </article>
  )
}
