import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Newspaper } from 'lucide-react'
import { supabase } from '../lib/supabaseClient.js'

export default function WeeklyArchivePage() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    supabase
      .from('weekly_reviews')
      .select('week_start, title')
      .order('week_start', { ascending: false })
      .then(({ data }) => {
        if (!cancelled) {
          setReviews(data ?? [])
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="site-container site-page">
      <div className="page-header">
        <div className="page-header-title">
          <Newspaper size={18} />
          <h2 className="page-title">지난 시황 모아보기</h2>
        </div>
      </div>

      {loading && <p className="page-empty">불러오는 중입니다...</p>}
      {!loading && reviews.length === 0 && <p className="page-empty">아직 쌓인 총평이 없습니다.</p>}

      <ul className="archive-list">
        {reviews.map((r) => (
          <li key={r.week_start}>
            <Link to={`/weekly/${r.week_start}`} className="archive-list-item">
              <span className="archive-list-date">{r.week_start} 주</span>
              <span className="archive-list-meta">{r.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
