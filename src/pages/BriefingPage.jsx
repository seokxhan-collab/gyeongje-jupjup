import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ExternalLink, Sparkles } from 'lucide-react'
import { supabase } from '../lib/supabaseClient.js'
import { useDocumentMeta } from '../lib/useDocumentMeta.js'
import AdSlot from '../components/AdSlot.jsx'

export default function BriefingPage() {
  const { date } = useParams()
  const [briefing, setBriefing] = useState(null)
  const [loading, setLoading] = useState(true)

  useDocumentMeta({
    title: '데일리 브리핑',
    description: 'AI가 그날의 주요 경제 뉴스를 골라 재구성해 요약하는 데일리 브리핑입니다.',
  })

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    let query = supabase.from('briefings').select('briefing_date, items, created_at')
    query = date
      ? query.eq('briefing_date', date).maybeSingle()
      : query.order('briefing_date', { ascending: false }).limit(1).maybeSingle()

    query.then(({ data }) => {
      if (!cancelled) {
        setBriefing(data)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [date])

  if (loading) {
    return (
      <div className="site-container site-page">
        <p className="page-empty">브리핑을 불러오는 중입니다...</p>
      </div>
    )
  }

  if (!briefing || !briefing.items?.length) {
    return (
      <div className="site-container site-page">
        <h2 className="page-title">데일리 브리핑</h2>
        <p className="page-empty">
          {date ? '해당 날짜의 브리핑을 찾을 수 없습니다.' : '아직 발행된 브리핑이 없습니다. 매일 아침 업데이트됩니다.'}
        </p>
        <Link to="/briefing/archive" className="page-archive-link">
          지난 브리핑 모아보기
        </Link>
      </div>
    )
  }

  return (
    <div className="site-container site-page">
      <AdSlot placement="top-banner" />

      <div className="page-header">
        <div className="page-header-title">
          <Sparkles size={18} />
          <h2 className="page-title">데일리 브리핑</h2>
        </div>
        <span className="page-date">{briefing.briefing_date}</span>
      </div>

      <Link to="/briefing/archive" className="page-archive-link">
        지난 브리핑 모아보기
      </Link>

      <section className="briefing briefing-page">
        <ol className="briefing-list">
          {briefing.items.map((item, i) => (
            <li key={i} className="briefing-item">
              <p className="briefing-item-summary">{item.summary}</p>
              <a href={item.link} target="_blank" rel="noopener noreferrer" className="briefing-item-source">
                {item.source} <ExternalLink size={12} />
              </a>
            </li>
          ))}
        </ol>
      </section>

      <p className="page-disclaimer">AI가 원문을 재구성해 요약한 내용입니다. 정확한 내용은 원문을 확인하세요.</p>
    </div>
  )
}
