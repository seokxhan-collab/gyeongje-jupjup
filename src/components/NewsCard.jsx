import { Bookmark, ExternalLink } from 'lucide-react'
import { formatRelativeTime } from '../lib/time.js'
import { categoryLabel } from '../lib/categories.js'
import { useBookmarks } from '../lib/useBookmarks.js'

export default function NewsCard({ item }) {
  const { isBookmarked, toggleBookmark } = useBookmarks()
  const saved = isBookmarked(item.id)

  return (
    <article className="news-card">
      <div className="news-card-meta">
        <div className="news-card-tags">
          <span className={`badge badge-${item.source_country}`}>{item.source}</span>
          <span className={`badge badge-category badge-category-${item.category}`}>
            {categoryLabel(item.category)}
          </span>
        </div>
        <span className="news-card-time">{formatRelativeTime(item.published_at)}</span>
      </div>
      <h3 className="news-card-title">{item.title}</h3>
      {item.summary && <p className="news-card-summary">{item.summary}</p>}
      <div className="news-card-footer">
        <a className="news-card-link" href={item.link} target="_blank" rel="noopener noreferrer">
          원문 보기 <ExternalLink size={14} />
        </a>
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
