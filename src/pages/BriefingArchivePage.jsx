import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { supabase } from '../lib/supabaseClient.js'
import { useDocumentMeta } from '../lib/useDocumentMeta.js'
import AdSlot from '../components/AdSlot.jsx'

export default function BriefingArchivePage() {
  const [briefings, setBriefings] = useState([])
  const [loading, setLoading] = useState(true)

  useDocumentMeta({
    title: '지난 브리핑 모아보기',
    description: '경제줍줍이 매일 발행해온 데일리 브리핑을 날짜별로 다시 볼 수 있습니다.',
  })

  useEffect(() => {
    let cancelled = false
    supabase
      .from('briefings')
      .select('briefing_date, items')
      .order('briefing_date', { ascending: false })
      .then(({ data }) => {
        if (!cancelled) {
          setBriefings(data ?? [])
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="site-container site-page">
      <AdSlot placement="top-banner" />

      <div className="page-header">
        <div className="page-header-title">
          <Sparkles size={18} />
          <h2 className="page-title">지난 브리핑 모아보기</h2>
        </div>
      </div>

      {loading && <p className="page-empty">불러오는 중입니다...</p>}
      {!loading && briefings.length === 0 && <p className="page-empty">아직 쌓인 브리핑이 없습니다.</p>}

      <ul className="archive-list">
        {briefings.map((b) => (
          <li key={b.briefing_date}>
            <Link to={`/briefing/${b.briefing_date}`} className="archive-list-item">
              <span className="archive-list-date">{b.briefing_date}</span>
              <span className="archive-list-meta">뉴스 {b.items?.length ?? 0}건</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
