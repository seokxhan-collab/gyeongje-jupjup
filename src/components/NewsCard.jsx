import { ExternalLink } from 'lucide-react'
import { formatRelativeTime } from '../lib/time.js'

export default function NewsCard({ item }) {
  return (
    <article className="news-card">
      <div className="news-card-meta">
        <span className={`badge badge-${item.source_country}`}>{item.source}</span>
        <span className="news-card-time">{formatRelativeTime(item.published_at)}</span>
      </div>
      <h3 className="news-card-title">{item.title}</h3>
      {item.summary && <p className="news-card-summary">{item.summary}</p>}
      <a className="news-card-link" href={item.link} target="_blank" rel="noopener noreferrer">
        원문 보기 <ExternalLink size={14} />
      </a>
    </article>
  )
}
