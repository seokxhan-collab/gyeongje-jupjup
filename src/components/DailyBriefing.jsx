import { useEffect, useState } from 'react'
import { ExternalLink, Sparkles } from 'lucide-react'
import { supabase } from '../lib/supabaseClient.js'

export default function DailyBriefing() {
  const [briefing, setBriefing] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    supabase
      .from('briefings')
      .select('briefing_date, items, created_at')
      .order('briefing_date', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) {
          setBriefing(data)
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (loading || !briefing) return null

  return (
    <section className="briefing">
      <div className="briefing-header">
        <div className="briefing-header-title">
          <Sparkles size={18} />
          <h2>오늘의 경제 브리핑</h2>
        </div>
        <span className="briefing-date">{briefing.briefing_date}</span>
      </div>
      <ol className="briefing-list">
        {(briefing.items ?? []).map((item, i) => (
          <li key={i} className="briefing-item">
            <p className="briefing-item-summary">{item.summary}</p>
            <a href={item.link} target="_blank" rel="noopener noreferrer" className="briefing-item-source">
              {item.source} <ExternalLink size={12} />
            </a>
          </li>
        ))}
      </ol>
      <p className="briefing-disclaimer">AI가 원문을 재구성해 요약한 내용입니다. 정확한 내용은 원문을 확인하세요.</p>
    </section>
  )
}
