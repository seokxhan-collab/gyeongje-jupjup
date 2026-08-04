import { Bookmark } from 'lucide-react'
import { useBookmarks } from '../lib/useBookmarks.js'
import NewsCard from '../components/NewsCard.jsx'

export default function SavedPage() {
  const { bookmarks } = useBookmarks()

  return (
    <div className="site-container site-main-container">
      <div className="page-header">
        <div className="page-header-title">
          <Bookmark size={18} />
          <h2 className="page-title">저장한 기사</h2>
        </div>
      </div>

      {bookmarks.length === 0 ? (
        <p className="page-empty">
          아직 저장한 기사가 없습니다. 기사 카드의 <Bookmark size={13} style={{ verticalAlign: '-2px' }} /> 아이콘을 눌러 저장해보세요.
        </p>
      ) : (
        <div className="news-grid">
          {bookmarks.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
